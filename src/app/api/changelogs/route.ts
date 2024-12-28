import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Log the query attempt
    console.log('Attempting to fetch changelogs...')

    const changelogs = await prisma.changelog.findMany({
      include: {
        changes: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Log the result
    console.log('Changelogs fetched:', changelogs ? changelogs.length : 0)

    if (!changelogs || changelogs.length === 0) {
      return NextResponse.json({ 
        data: [],
        message: 'No changelogs found'
      })
    }

    return NextResponse.json({ 
      data: changelogs,
      count: changelogs.length 
    })

  } catch (error) {
    // Log the full error
    console.error('Database error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch changelogs',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )

  } finally {
    await prisma.$disconnect()
  }
} 