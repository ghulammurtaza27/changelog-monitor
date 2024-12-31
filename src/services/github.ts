import { Octokit } from '@octokit/rest'

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async listCommits(owner: string, repo: string) {
    return await this.octokit.repos.listCommits({
      owner,
      repo,
      per_page: 5
    });
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