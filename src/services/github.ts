import { Octokit } from '@octokit/rest'

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async listCommits(owner: string, repo: string, options?: { since?: Date; until?: Date }) {
    // Adjust dates to cover full day in UTC
    const since = options?.since 
      ? new Date(options.since.setUTCHours(0, 0, 0, 0))
      : undefined;
    
    const until = options?.until
      ? new Date(options.until.setUTCHours(23, 59, 59, 999))
      : undefined;

    const response = await this.octokit.repos.listCommits({
      owner,
      repo,
      since: since?.toISOString(),
      until: until?.toISOString(),
      per_page: 25
    });

    console.log('GitHub API Response:', {
      total: response.data.length,
      dates: response.data.map(commit => commit.commit.author?.date),
      shas: response.data.map(commit => commit.sha)
    });

    return response;
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