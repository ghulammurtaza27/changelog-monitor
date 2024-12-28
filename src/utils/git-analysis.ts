import { GitHubService } from '../services/github';

export function detectChangeType(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('breaking change')) return 'BREAKING';
  if (lowerMessage.includes('feat:')) return 'FEATURE';
  if (lowerMessage.includes('fix:')) return 'BUGFIX';
  if (lowerMessage.includes('docs:')) return 'DOCS';
  if (lowerMessage.includes('perf:')) return 'PERFORMANCE';
  if (lowerMessage.includes('refactor:')) return 'REFACTOR';
  return 'OTHER';
}

export async function analyzeCodeChanges(githubService: GitHubService, owner: string, repo: string, commits: any[]) {
  const allChanges = await Promise.all(
    commits.map(async (commit) => {
      const { data } = await githubService.getCommit(owner, repo, commit.sha);
      return {
        files: data.files || [],
        commit: commit,
        stats: data.stats
      };
    })
  );

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
  };
} 