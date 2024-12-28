export interface Change {
  id: string;
  changelogId: string;
  description: string;
  type: string;
  impact: string;
  whatsNew: string;
  details: string;
  author: string;
  date: string;
  sha: string;
  changelog: Changelog;
  createdAt: Date;
  updatedAt: Date;
}

export interface Changelog {
  id: string;
  repoUrl: string;
  version: string;
  date: Date;
  title: string;
  summary: string;
  whatsNew: string;
  impact: string;
  upgrade: string;
  changes: Change[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangelogResponse {
  success: boolean;
  data?: Changelog[];
  error?: string;
} 