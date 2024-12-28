import { Octokit } from '@octokit/rest'

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN // Make sure to set this in your .env file
})

export async function fetchCommits(repoUrl: string, fromDate: string, toDate: string) {
  try {
    // Parse the GitHub repo URL to get owner and repo name
    const [, , , owner, repo] = repoUrl.split('/')
    
    console.log(`Fetching commits for ${owner}/${repo} from ${fromDate} to ${toDate}`)

    const response = await octokit.repos.listCommits({
      owner,
      repo,
      since: new Date(fromDate).toISOString(),
      until: new Date(toDate).toISOString(),
      per_page: 100 // Adjust this number based on your needs
    })

    console.log(`Found ${response.data.length} commits`)

    return response.data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name || 'Unknown',
      date: commit.commit.author?.date || new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error fetching commits:', error)
    throw new Error(`Failed to fetch commits: ${error.message}`)
  }
}

export async function generateChangelog(commits: any[]) {
  // Group commits by type (feat, fix, etc.)
  const groupedCommits = commits.reduce((acc, commit) => {
    const message = commit.message
    let type = 'other'

    // Try to parse conventional commits
    const match = message.match(/^(feat|fix|chore|docs|style|refactor|perf|test)(\(.+\))?!?: (.+)/)
    if (match) {
      type = match[1]
    }

    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(commit)
    return acc
  }, {})

  // Generate summary
  const summary = `**Changelog Summary**\n\n${
    Object.entries(groupedCommits)
      .map(([type, commits]) => `${type}: ${commits.length} changes`)
      .join('\n')
  }`

  // Generate changes list
  const changes = Object.entries(groupedCommits).flatMap(([type, commits]: [string, any[]]) =>
    commits.map(commit => `${type}: ${commit.message.split('\n')[0]}`)
  )

  return {
    version: `v${new Date().toISOString().split('T')[0]}`,
    date: new Date(),
    summary,
    changes
  }
} 