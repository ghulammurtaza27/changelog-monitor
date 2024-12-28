import { ChangeDetails } from './ChangeDetails'
import { BugIcon, StarIcon, SecurityIcon, BreakingIcon, PerformanceIcon, EnhancementIcon, DocsIcon, DependencyIcon, OtherIcon, RefactorIcon } from '../icons';
import { useEffect, useRef } from 'react';


interface Change {
  id: string;
  description: string;
  type: string;
  impact: string;
  whatsNew: string;
  details: string;
  author: string;
  date: string;
  sha: string;
}

interface ChangeModalProps {
  change: Change;
  onClose: () => void;
  repoUrl: string;
}

const getIconComponent = (type: string) => {
  const iconMap = {
    'BUGFIX': BugIcon,
    'FEATURE': StarIcon,
    'SECURITY': SecurityIcon,
    'BREAKING': BreakingIcon,
    'PERFORMANCE': PerformanceIcon,
    'ENHANCEMENT': EnhancementIcon,
    'DOCS': DocsIcon,
    'DEPENDENCY': DependencyIcon,
    'REFACTOR': RefactorIcon,
    'OTHER': OtherIcon
  };

  const IconComponent = iconMap[type as keyof typeof iconMap] || OtherIcon;
  return <IconComponent className="w-5 h-5" />;
};

export function ChangeModal({ change, onClose, repoUrl }: ChangeModalProps) {
  // Add keyboard support for Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Add click outside to close
  const modalRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div onClick={handleClickOutside} className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header with type indicator */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {getIconComponent(change.type)}
            <h3 className="text-lg font-semibold text-gray-900">Change Details</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              change.type === 'BREAKING' ? 'bg-red-100 text-red-800' :
              change.type === 'FEATURE' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {change.type}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Metadata section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Author:</span>
                <span className="font-medium">{change.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">
                  {new Date(change.date).toLocaleDateString()}
                </span>
              </div>
              {change.sha && (
                <a 
                  href={`${repoUrl}/commit/${change.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                  </svg>
                  View Commit
                </a>
              )}
            </div>
          </div>

          {/* Impact indicator */}
          {change.impact && (
            <div className={`px-6 py-3 ${
              change.impact === 'HIGH' ? 'bg-red-50 text-red-700' :
              change.impact === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
              'bg-green-50 text-green-700'
            }`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/>
                </svg>
                <span className="font-medium">Impact Level: {change.impact}</span>
              </div>
            </div>
          )}

          {/* Change details */}
          <div className="p-6">
            <ChangeDetails change={change} repoUrl={repoUrl} />
          </div>
        </div>

        {/* Footer with actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {change.sha && (
            <button 
              onClick={() => navigator.clipboard.writeText(change.sha)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Copy SHA
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 