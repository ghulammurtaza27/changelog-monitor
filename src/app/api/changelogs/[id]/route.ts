import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const changelog = await prisma.changelog.findUnique({
      where: {
        id: params.id
      },
      include: {
        changes: true
      }
    })

    if (!changelog) {
      return NextResponse.json(
        { error: 'Changelog not found' },
        { status: 404 }
      )
    }

    // Transform to match Stripe's format
    const formattedChangelog = {
      id: changelog.id,
      version: changelog.version,
      date: changelog.date,
      title: changelog.title,
      summary: changelog.summary,
      whatsNew: changelog.whatsNew,
      impact: changelog.impact,
      upgrade: changelog.upgrade,
      changes: changelog.changes.map(change => ({
        id: change.id,
        title: change.description,
        type: change.type,
        whatsNew: change.whatsNew,
        impact: change.impact,
        details: change.details,
        metadata: {
          author: change.author,
          sha: change.sha,
          date: change.date
        }
      }))
    }

    return NextResponse.json({
      data: formattedChangelog
    })
  } catch (error) {
    console.error('Error fetching changelog:', error)
    return NextResponse.json(
      { error: 'Failed to fetch changelog' },
      { status: 500 }
    )
  }
} 