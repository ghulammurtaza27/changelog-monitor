import { GoogleGenerativeAI } from '@google/generative-ai'
import { RATE_LIMIT } from '@/utils/timing'
import { delay } from '@/utils/helpers'

interface Analysis {
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
  changes: Array<{
    files: string[];
    message: string;
    author: string;
    sha: string;
  }>;
}

interface GeminiResponse {
  category: string;
  technicalSummary: string;
  impact: string;
  breaking: boolean;
  securityRelated: boolean;
}

export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateChangelog(analysis: Analysis) {
    await delay(RATE_LIMIT.requestDelay);
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = this.createPrompt(analysis);
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async analyzeChangeImpact(change: any): Promise<GeminiResponse> {
    const defaultResponse: GeminiResponse = {
      category: 'OTHER',
      technicalSummary: '',
      impact: 'No impact analysis available',
      breaking: false,
      securityRelated: false
    };

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = this.createImpactPrompt(change);
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      try {
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

      // Fallback to text parsing if JSON fails
      return {
        category: text.match(/category[:\s]+([A-Z]+)/i)?.[1] || defaultResponse.category,
        technicalSummary: text.match(/technical[:\s]+(.*?)(?=\n|$)/i)?.[1] || defaultResponse.technicalSummary,
        impact: text.match(/impact[:\s]+(.*?)(?=\n|$)/i)?.[1] || defaultResponse.impact,
        breaking: text.toLowerCase().includes('breaking'),
        securityRelated: text.toLowerCase().includes('security')
      };
    } catch (error) {
      console.error('Error analyzing change impact:', error);
      return defaultResponse;
    }
  }

  private createPrompt(analysis: Analysis): string {
    return `
      As an expert developer, analyze these code changes and generate a detailed changelog entry.
      
      Code Analysis:
      - Total files changed: ${analysis.totalFiles}
      - Lines added: ${analysis.totalAdditions}
      - Lines deleted: ${analysis.totalDeletions}
      - File changes: ${JSON.stringify(analysis.changes.map(c => c.files))}
      
      Commit Information:
      ${JSON.stringify(analysis.changes.map(c => ({
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
    `;
  }

  private createImpactPrompt(change: any): string {
    // Extract meaningful information from the diff
    const diffSummary = this.processDiff(change.codeChanges || '');

    return `Analyze this code change and provide details in JSON format:
    
    Commit Message: ${change.message}
    Files changed: ${change.files?.length || 0}
    Additions: ${change.additions || 0}
    Deletions: ${change.deletions || 0}
    
    Code Changes Summary:
    ${diffSummary}
    
    Return only a JSON object with these fields:
    {
      "category": one of [FEATURE, BUGFIX, ENHANCEMENT, REFACTOR, DOCS, BREAKING, SECURITY, PERFORMANCE, DEPENDENCY, OTHER],
      "technicalSummary": "detailed technical description of what changed in the code, based on the actual code changes",
      "impact": "analysis of how these changes affect the system and developers",
      "breaking": boolean,
      "securityRelated": boolean
    }`;
  }

  private processDiff(diff: string): string {
    // Skip binary files and other non-text content
    if (!diff || diff.includes('Binary files')) {
      return 'No text changes available';
    }

    // Process the git diff to extract meaningful changes
    const changes = diff.split('\n')
      .filter(line => {
        // Filter out diff metadata and context lines
        return line.startsWith('+') || line.startsWith('-');
      })
      .map(line => {
        // Clean up the diff markers for better readability
        return line.replace(/^[+-]/, '').trim();
      })
      .filter(line => {
        // Filter out empty lines and common noise
        return line && 
               !line.match(/^\s*$/) && 
               !line.match(/^\s*\/\/\s*$/) &&
               !line.match(/^\s*console\.log/);
      });

    // Limit the number of changes to prevent token overflow
    const limitedChanges = changes.slice(0, 50);
    
    return limitedChanges.join('\n');
  }
}
