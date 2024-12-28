import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, fromDate, toDate } = await request.json()
    const [owner, repo] = repoUrl.split('github.com/')[1].split('/')

    console.log('Fetching commits for:', { owner, repo, fromDate, toDate })

    // Get list of commits
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      since: fromDate,
      until: toDate,
    })

    console.log(`Found ${commits.length} commits`)

    // Get detailed changes for each commit
    const detailedCommits = await Promise.all(
      commits.map(async (commit) => {
        console.log(`\nProcessing commit: ${commit.sha}`)
        
        // Get the full commit details
        const { data: detail } = await octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        })

        console.log('Files in commit:', detail.files?.length || 0)

        const fileChanges = detail.files?.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          patch: file.patch || null,
          raw_url: file.raw_url
        })) || []

        // Log each file's changes
        fileChanges.forEach(file => {
          console.log(`\nFile: ${file.filename}`)
          console.log(`Status: ${file.status}`)
          console.log(`Changes: +${file.additions} -${file.deletions}`)
          console.log(`Has patch: ${Boolean(file.patch)}`)
        })

        const codeChanges = fileChanges
          .filter(file => file.patch)
          .map(file => `
File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} -${file.deletions}
Patch:
${file.patch}
          `)
          .join('\n\n')

        console.log(`Generated code changes length: ${codeChanges.length}`)

        return {
          message: commit.commit.message,
          author: commit.commit.author?.name || 'Unknown',
          date: commit.commit.author?.date,
          sha: commit.sha,
          files: fileChanges.map(f => ({
            name: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions
          })),
          codeChanges: codeChanges || 'No code changes available',
          stats: detail.stats || { total: 0, additions: 0, deletions: 0 }
        }
      })
    )

    console.log('\nProcessed all commits')
    return NextResponse.json({ 
      changes: detailedCommits,
      debug: {
        totalCommits: commits.length,
        totalFiles: detailedCommits.reduce((acc, c) => acc + c.files.length, 0),
        hasCodeChanges: detailedCommits.some(c => c.codeChanges !== 'No code changes available')
      }
    })

  } catch (error) {
    console.error('Error in GitHub API:', error)
    return NextResponse.json(
      { 
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}