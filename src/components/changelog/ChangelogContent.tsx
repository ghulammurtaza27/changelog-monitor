import { ChangeList } from './ChangeList'
import { Change as ChangeType } from '@/types/changelog';
import { BugIcon, StarIcon, SecurityIcon, BreakingIcon, PerformanceIcon, EnhancementIcon, DocsIcon, DependencyIcon, OtherIcon, RefactorIcon } from '../icons';


interface ChangelogContentProps {
  changes: Partial<ChangeType>[];
  repoUrl: string;
  onChangeSelect: (change: Partial<ChangeType>, repoUrl: string) => void;
  version?: string;
  viewMode?: string;
}

export function ChangelogContent({ changes, repoUrl, onChangeSelect, version, viewMode }: ChangelogContentProps) {
  // Group changes by type
  const groupedChanges = changes.reduce((groups, change) => {
    const type = change.type || 'OTHER';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(change);
    return groups;
  }, {} as Record<string, Partial<ChangeType>[]>);

  return (
    <div>
      {version && (
        <div className="mb-4 flex items-center gap-2">
          <h1 className="text-3xl font-bold">Version {version}</h1>
          <button 
            onClick={() => navigator.clipboard.writeText(version)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg /* Add copy icon */ />
          </button>
        </div>
      )}

      <div className="mb-6 flex gap-4 text-sm text-gray-600">
        <span>{changes.filter(c => c.type === 'FEATURE').length} new features</span>
        <span>{changes.filter(c => c.type === 'BUGFIX').length} bug fixes</span>
        <span>{changes.filter(c => c.type === 'BREAKING').length} breaking changes</span>
      </div>

      <h2 className="text-2xl font-semibold mb-6">
        {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
         {changes.length > 0 && `(${changes.length} changes)`}
         {changes.length === 0 && 'No changes'}
      </h2>

     

      {Object.entries(groupedChanges).map(([type, typeChanges]) => (
        <div key={type} className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {type === 'BUGFIX' && <BugIcon className="w-5 h-5 text-red-500" />}
            {type === 'FEATURE' && <StarIcon className="w-5 h-5 text-green-500" />}
            {type === 'SECURITY' && <SecurityIcon className="w-5 h-5 text-yellow-500" />}
            {type === 'BREAKING' && <BreakingIcon className="w-5 h-5 text-orange-500" />}
            {type === 'PERFORMANCE' && <PerformanceIcon className="w-5 h-5 text-blue-500" />}
            {type === 'ENHANCEMENT' && <EnhancementIcon className="w-5 h-5 text-purple-500" />}
            {type === 'DOCS' && <DocsIcon className="w-5 h-5 text-gray-500" />}
            {type === 'DEPENDENCY' && <DependencyIcon className="w-5 h-5 text-gray-500" />}
            {type === 'OTHER' && <OtherIcon className="w-5 h-5 text-gray-500" />}
            {type === 'REFACTOR' && <RefactorIcon className="w-5 h-5 text-gray-500" />}
            
            {type === 'BUGFIX' ? 'Bug Fixes' : 
             type === 'REFACTOR' ? 'Refactors' : 
             type === 'FEATURE' ? 'New Features' : 
             type === 'BREAKING' ? 'Breaking Changes' : 
             type === 'SECURITY' ? 'Security Updates' :
             type === 'PERFORMANCE' ? 'Performance Improvements' :
             type === 'ENHANCEMENT' ? 'Enhancements' :
             type === 'DOCS' ? 'Documentation' :
             type === 'DEPENDENCY' ? 'Dependencies' :
             type === 'OTHER' ? 'Other Changes' :
            
             'Other Changes'}
          </h3>
          <ChangeList 
            changes={typeChanges as ChangeType[]} 
            repoUrl={repoUrl}
            onChangeSelect={(change) => onChangeSelect(change, repoUrl)}
          />
        </div>
      ))}
    </div>
  );
} 