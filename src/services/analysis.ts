import { PrismaClient } from '@prisma/client'

export class AnalysisService {
  private prisma: PrismaClient;

  constructor(apiKey: string) {
    this.prisma = new PrismaClient();
  }

  async createChangelogEntry(repoUrl: string, repo: string, analyzedChanges: any[]) {
    const now = new Date();
    return await this.prisma.changelog.create({
      data: {
        id: crypto.randomUUID(),
        repoUrl,
        version: `v${now.toISOString().split('T')[0]}`,
        date: now,
        title: `Changelog for ${repo}`,
        summary: analyzedChanges.map(c => c.description).join(' '),
        whatsNew: analyzedChanges.map(c => c.whatsNew).join(' '),
        impact: analyzedChanges.map(c => c.impact).join(' '),
        upgrade: '',
        createdAt: now,
        updatedAt: now,
        changes: {
          create: analyzedChanges.map(change => ({
            id: crypto.randomUUID(),
            description: change.description,
            type: change.type,
            impact: change.impact,
            author: change.author,
            date: change.date,
            details: '',
            sha: change.sha,
            whatsNew: change.whatsNew,
            diff: change.diff,
            createdAt: now,
            updatedAt: now
          }))
        }
      },
      include: {
        changes: true
      }
    });
  }
} 