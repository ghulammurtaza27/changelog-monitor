import { ChangeList } from './ChangeList'
import { Change as ChangeType } from '@/types/changelog';

interface Change {
  id: string;
  description: string;
  type: string;
  impact: string;
  whatsNew: string;
}

interface ChangelogContentProps {
  changes: Partial<ChangeType>[];
  repoUrl: string;
  onChangeSelect: (change: Partial<ChangeType>, repoUrl: string) => void;
}

export function ChangelogContent({ changes, repoUrl, onChangeSelect }: ChangelogContentProps) {
  const changeTypes = [
    'FEATURE',
    'BUGFIX',
    'ENHANCEMENT',
    'REFACTOR',
    'DOCS',
    'BREAKING',
    'SECURITY',
    'PERFORMANCE',
    'DEPENDENCY',
    'OTHER'
  ];
  
  const formatTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'BUGFIX': 'Bug Fixes',
      'DEPENDENCY': 'Dependencies',
      'REFACTOR': 'Refactors',
      'DOCS': 'Documentation',
      'BREAKING': 'Breaking Changes',
      'SECURITY': 'Security Updates',
      'PERFORMANCE': 'Performance Improvements',
      'FEATURE': 'Features',
      'ENHANCEMENT': 'Enhancements',
      'OTHER': 'Other Changes'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-12 px-6">
      {changeTypes.map(type => {
        const typeChanges = changes.filter(change => change.type === type);
        if (typeChanges.length === 0) return null;

        return (
          <div key={type} className="group">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-base font-semibold text-gray-900 tracking-wide">
                {formatTypeLabel(type)}
              </h3>
              <div className="h-[1px] flex-grow bg-gray-200" />
            </div>
            <div className="space-y-4">
              <ChangeList 
                changes={typeChanges as ChangeType[]} 
                repoUrl={repoUrl}
                onChangeSelect={(change) => onChangeSelect(change, repoUrl)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
} 