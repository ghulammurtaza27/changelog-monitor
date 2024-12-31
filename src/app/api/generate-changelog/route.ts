import { GitHubService } from '@/services/github'
import { AIService } from '@/services/ai'
import { AnalysisService } from '@/services/analysis'
import { delay, analyzeCodeChanges } from '@/utils'
import { RATE_LIMIT } from '@/utils/timing'

// Initialize services
const githubService = new GitHubService(process.env.GITHUB_TOKEN!);
const aiService = new AIService(process.env.GEMINI_API_KEY!);
const analysisService = new AnalysisService(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  console.log('Starting changelog generation');
  
  try {
    // 1. Parse request
    const { repoUrl } = await req.json();
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

    // 2. Fetch commits
    const { data: commits } = await githubService.listCommits(owner, repo);
    console.log(`Fetched ${commits.length} commits`);

    // 3. Analyze code changes
    const analysis = await analyzeCodeChanges(githubService, owner, repo, commits);
    console.log('Code analysis complete');

    // 4. Process each change with AI
    const analyzedChanges = [];
    for (const change of analysis.changes) {
      console.log(`Analyzing change: ${change.sha.slice(0, 7)}`);
      
      // Get the git diff for this commit
      const diffContent = await githubService.getCommitDiff(owner, repo, change.sha);
      
      // Add the diff to the change object
      const enrichedChange = {
        ...change,
        codeChanges: diffContent
      };
      
      const analysisResult = await aiService.analyzeChangeImpact(enrichedChange);
      analyzedChanges.push({
        description: change.message.split('\n')[0],
        type: analysisResult.category,
        impact: analysisResult.impact,
        author: change.author,
        date: change.date,
        sha: change.sha,
        whatsNew: analysisResult.technicalSummary
      });

      await delay(RATE_LIMIT.batchDelay);
    }

    // 5. Create changelog entry
    const changelog = await analysisService.createChangelogEntry(repoUrl, repo, analyzedChanges);
    console.log('Changelog created:', changelog.id);

    // 6. Return response
    return Response.json({ 
      success: true, 
      data: changelog 
    });

  } catch (error) {
    console.error('Changelog generation failed:', error);
    
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { 
      status: 500 
    });
  }
}