import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Octokit } from '@octokit/rest'

// Initialize clients
const prisma = new PrismaClient()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

// Rate limiting configuration
const RATE_LIMIT = {
  maxRetries: 3,
  baseDelay: 5000,    // 5 seconds
  batchSize: 1,        // Process 1 at a time
  batchDelay: 5000,   // 5 seconds between batches
  requestDelay: 5000   // 5 seconds between requests
}

// Helper functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function sanitizeForDB(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

async function waitForRateLimit() {
  const waitTime = RATE_LIMIT.requestDelay
  console.log(`Rate limit wait: ${waitTime}ms`)
  await delay(waitTime)
}

interface CommitChange {
  files: string[];
  message: string;
  author: string;
  sha: string;
}

interface Analysis {
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
  changes: CommitChange[];
}

function createPrompt(analysis: Analysis) {
  return `
    As an expert developer, analyze these code changes and generate a detailed changelog entry.
    
    Code Analysis:
    - Total files changed: ${analysis.totalFiles}
    - Lines added: ${analysis.totalAdditions}
    - Lines deleted: ${analysis.totalDeletions}
    - File changes: ${JSON.stringify(analysis.changes.map((c: CommitChange) => c.files))}
    
    Commit Information:
    ${JSON.stringify(analysis.changes.map((c: CommitChange) => ({
      message: c.message,
      author: c.author,
      sha: c.sha.slice(0, 7),
      files: c.files
    })), null, 2)}
    
    Please generate a detailed changelog with these specific sections:

    1. What's New (Technical Details):
    - Main feature/change in one sentence
    - Technical implementation details
    - New capabilities or functionality added
    - Any new APIs or interfaces
    
    2. Impact (Business & Developer Value):
    - How developers can use this change
    - Benefits and improvements
    - Use cases and examples
    - Migration or upgrade considerations
    - Performance or security implications
    
    Format each section to be clear and actionable, similar to this example:
    What's New:
    Adds SDK support for the trace_id field on the Payout object.
    Banking partners create the trace ID for payouts. You can use these IDs to track missing or delayed payouts with your bank.

    Impact:
    You can now access the payout trace_id using the Stripe SDK.
    For Connect users, you can provide their trace IDs by retrieving a payout, enabling self-service for late or missing payouts without manual support.
  `
}

function parseGeminiResponse(text: string): { whatsNew: string, impact: string } {
  if (!text) return { whatsNew: '', impact: '' };

  try {
    // Split the text into sections
    const sections = text.split(/\*\*/).filter(Boolean);
    
    let whatsNew = '';
    let impact = '';
    
    // Process each section
    sections.forEach(section => {
      const cleanSection = section.trim();
      if (cleanSection.toLowerCase().startsWith('what changed')) {
        // Extract content after "What changed" until the next section
        whatsNew = cleanSection
          .replace(/what changed:?/i, '')
          .split(/potential impact/i)[0]
          .replace(/[-•]/g, '')
          .trim();
      } else if (cleanSection.toLowerCase().startsWith('potential impact')) {
        // Extract content after "Potential impact"
        impact = cleanSection
          .replace(/potential impact:?/i, '')
          .replace(/[-•]/g, '')
          .trim();
      }
    });

    // Clean up any markdown remnants and normalize whitespace
    const cleanText = (text: string) => {
      return text
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    return {
      whatsNew: cleanText(whatsNew),
      impact: cleanText(impact)
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return { whatsNew: '', impact: '' };
  }
}

async function generateChangelogWithAI(analysis: any) {
  try {
    await waitForRateLimit()
    console.log('Generating AI content for:', {
      files: analysis.totalFiles,
      additions: analysis.totalAdditions,
      deletions: analysis.totalDeletions,
      changes: analysis.changes.map((c: any) => ({
        message: c.message.split('\n')[0],
        author: c.author,
        sha: c.sha?.slice(0, 7)
      }))
    })

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const prompt = createPrompt(analysis)
    console.log('Sending prompt to Gemini:', prompt)

    const result = await model.generateContent(prompt)
    console.log('Raw Gemini response:', result.response)
    console.log('Gemini text response:', result.response.text())

    return result.response.text()
  } catch (error) {
    console.error('AI generation error:', error)
    return null
  }
}

async function analyzeCodeChanges(owner: string, repo: string, commits: any[]) {
  const allChanges = await Promise.all(
    commits.map(async (commit) => {
      const { data } = await octokit.repos.getCommit({
        owner,
        repo,
        ref: commit.sha
      })

      return {
        files: data.files || [],
        commit: commit,
        stats: data.stats
      }
    })
  )

  return {
    totalFiles: allChanges.reduce((sum, change) => sum + change.files.length, 0),
    totalAdditions: allChanges.reduce((sum, change) => sum + (change.stats?.additions || 0), 0),
    totalDeletions: allChanges.reduce((sum, change) => sum + (change.stats?.deletions || 0), 0),
    changes: allChanges.map(change => ({
      message: change.commit.commit.message,
      author: change.commit.commit.author.name,
      date: change.commit.commit.author.date,
      sha: change.commit.sha,
      files: change.files.map(file => ({
        name: file.filename,
        additions: file.additions,
        deletions: file.deletions
      }))
    }))
  }
}

function detectChangeType(message: string): string {
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('breaking change')) return 'BREAKING'
  if (lowerMessage.includes('feat:')) return 'FEATURE'
  if (lowerMessage.includes('fix:')) return 'BUGFIX'
  if (lowerMessage.includes('docs:')) return 'DOCS'
  if (lowerMessage.includes('perf:')) return 'PERFORMANCE'
  if (lowerMessage.includes('refactor:')) return 'REFACTOR'
  return 'OTHER'
}

interface GeminiResponse {
  category: string;
  technicalSummary: string;
  impact: string;
  breaking: boolean;
  securityRelated: boolean;
}

async function analyzeChangeImpact(change: any): Promise<GeminiResponse> {
  const defaultResponse: GeminiResponse = {
    category: 'OTHER',
    technicalSummary: '',
    impact: 'No impact analysis available',
    breaking: false,
    securityRelated: false
  };

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const prompt = `Analyze this code change and provide details in JSON format:
    
    Commit Message: ${change.message}
    Files changed: ${change.files?.length || 0}
    Additions: ${change.additions || 0}
    Deletions: ${change.deletions || 0}
    
    Code Changes:
    ${change.codeChanges || 'No code changes available'}
    
    Return only a JSON object with these fields:
    {
      "category": one of [FEATURE, BUGFIX, ENHANCEMENT, REFACTOR, DOCS, BREAKING, SECURITY, PERFORMANCE, DEPENDENCY, OTHER],
      "technicalSummary": "detailed description of what changed in the code",
      "impact": "analysis of the changes' impact",
      "breaking": boolean,
      "securityRelated": boolean
    }`

    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    console.log('Raw Gemini response:', text);

    try {
      // Try to parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return {
          category: parsedResponse.category || defaultResponse.category,
          technicalSummary: parsedResponse.technicalSummary || defaultResponse.technicalSummary,
          impact: parsedResponse.impact || defaultResponse.impact,
          breaking: parsedResponse.breaking || defaultResponse.breaking,
          securityRelated: parsedResponse.securityRelated || defaultResponse.securityRelated
        };
      }
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
    }

    // If JSON parsing fails, try to extract information from text
    const category = text.match(/category[:\s]+([A-Z]+)/i)?.[1] || defaultResponse.category;
    const impact = text.match(/impact[:\s]+(.*?)(?=\n|$)/i)?.[1] || defaultResponse.impact;
    const technical = text.match(/technical[:\s]+(.*?)(?=\n|$)/i)?.[1] || defaultResponse.technicalSummary;
    
    return {
      category,
      technicalSummary: technical,
      impact,
      breaking: text.toLowerCase().includes('breaking'),
      securityRelated: text.toLowerCase().includes('security')
    };

  } catch (error) {
    console.error('Error analyzing change impact:', error);
    return defaultResponse;
  }
}

async function createChangelogEntry(
  prisma: PrismaClient,
  repoUrl: string,
  repo: string,
  analyzedChanges: any[]
) {
  const now = new Date();
  const changelogId = crypto.randomUUID();

  // Prepare summary and content with clean strings
  const summary = analyzedChanges
    .map(c => sanitizeForDB(c.description))
    .filter(Boolean)
    .join(' ');

  const whatsNew = analyzedChanges
    .map(c => sanitizeForDB(c.whatsNew))
    .filter(Boolean)
    .join(' ');

  const impact = analyzedChanges
    .map(c => sanitizeForDB(c.impact))
    .filter(Boolean)
    .join(' ');

  // Create changelog with proper sanitization and nested changes
  return await prisma.changelog.create({
    data: {
      id: changelogId,
      repoUrl: sanitizeForDB(repoUrl),
      version: `v${now.toISOString().split('T')[0]}`,
      date: now,
      title: sanitizeForDB(`Changelog for ${repo}`),
      summary: summary || 'No changes',
      whatsNew: whatsNew || '',
      impact: impact || '',
      upgrade: '',
      createdAt: now,
      updatedAt: now,
      changes: {
        create: analyzedChanges.map(change => ({
          id: crypto.randomUUID(),
          description: sanitizeForDB(change.description),
          type: sanitizeForDB(change.type),
          impact: sanitizeForDB(change.impact),
          author: sanitizeForDB(change.author),
          date: sanitizeForDB(change.date),
          details: '',
          sha: sanitizeForDB(change.sha),
          whatsNew: sanitizeForDB(change.whatsNew),
          createdAt: now,
          updatedAt: now
        }))
      }
    },
    include: {
      changes: true
    }
  });
}

export async function POST(req: Request) {
  console.log('Starting POST request')
  
  try {
    const body = await req.json()
    console.log('Request body:', body)

    const repoUrl = body.repoUrl
    if (!repoUrl) {
      return new Response(
        JSON.stringify({ error: 'Repository URL is required' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const urlParts = repoUrl.replace('https://github.com/', '').split('/')
    const owner = urlParts[0]
    const repo = urlParts[1]

    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 5
    })

    const analysis = await analyzeCodeChanges(owner, repo, commits)
    const analyzedChanges = []

    for (const change of analysis.changes) {
      console.log('\n--- Processing change ---')
      console.log('Change message:', change.message.split('\n')[0])
      await delay(RATE_LIMIT.requestDelay)
      
      const analysisResult = await analyzeChangeImpact(change)
      console.log('Analysis result:', analysisResult)
      
      analyzedChanges.push({
        description: change.message.split('\n')[0] || 'No description provided',
        type: analysisResult?.category || detectChangeType(change.message),
        impact: analysisResult?.impact || 'No impact analysis available',
        author: change.author || '',
        date: change.date || new Date().toISOString(),
        details: '',
        sha: change.sha || '',
        whatsNew: analysisResult?.technicalSummary || ''
      })
      
      console.log('Added to analyzedChanges:', analyzedChanges[analyzedChanges.length - 1])
      await delay(RATE_LIMIT.batchDelay)
    }

    console.log('All changes processed, creating database entry...')

    const changelog = await createChangelogEntry(prisma, repoUrl, repo, analyzedChanges)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: changelog.id,
          changesCount: changelog.changes.length
        }
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Full error details:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate changelog',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}