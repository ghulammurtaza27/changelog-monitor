import { ChangelogContent } from './ChangelogContent'

interface Changelog {
  id: string;
  version: string;
  date: string;
  repoUrl: string;
  changes: Change[];
}

interface Change {
  id: string;
  description: string;
  type: string;
  impact: string;
  whatsNew: string;
}

interface ChangelogCardProps {
  changelog: Changelog;
  onChangeSelect: (change: Change) => void;
}

export function ChangelogCard({ changelog, onChangeSelect }: ChangelogCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">v{changelog.version}</h2>
        <time className="text-sm text-gray-500">
          {new Date(changelog.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </time>
      </div>
      <ChangelogContent 
        changes={changelog.changes} 
        repoUrl={changelog.repoUrl}
        onChangeSelect={onChangeSelect}
      />
    </div>
  );
} 