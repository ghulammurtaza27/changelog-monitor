import { Octokit } from '@octokit/rest'

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async listCommits(owner: string, repo: string, options?: { since?: Date; until?: Date }) {
    // Get the date strings without time
    const targetDate = options?.since?.toISOString().split('T')[0];

    const response = await this.octokit.repos.listCommits({
      owner,
      repo,
      per_page: 100 // Get maximum allowed commits
    });

    // Filter commits for the exact date
    const filteredData = response.data.filter(commit => {
      const commitDate = commit.commit.author?.date?.split('T')[0];
      return commitDate === targetDate;
    });

    console.log('GitHub API Response:', {
      total: filteredData.length,
      dates: filteredData.map(commit => commit.commit.author?.date),
      shas: filteredData.map(commit => commit.sha)
    });

    return { ...response, data: filteredData };
  }

  async getCommit(owner: string, repo: string, ref: string) {
    return await this.octokit.repos.getCommit({
      owner,
      repo,
      ref
    });
  }

  async getCommitDiff(owner: string, repo: string, sha: string) {
    const response = await this.octokit.repos.getCommit({
      owner,
      repo,
      ref: sha,
      mediaType: {
        format: 'diff'
      }
    });
    
    return response.data;
  }
} 