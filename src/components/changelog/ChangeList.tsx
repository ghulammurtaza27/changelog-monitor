interface Change {
  id: string;
  description: string;
  type: string;
  impact: string;
  whatsNew: string;
  author: string;
  date: string;
  sha: string;
}

interface ChangeListProps {
  changes: Change[];
  repoUrl: string;
  onChangeSelect: (change: Change) => void;
}

export function ChangeList({ changes, repoUrl, onChangeSelect }: ChangeListProps) {
  const getTypeColor = (type: string) => {
    const colors = {
      BREAKING: 'text-red-600 bg-red-50 border-red-200',
      SECURITY: 'text-orange-600 bg-orange-50 border-orange-200',
      FEATURE: 'text-green-600 bg-green-50 border-green-200',
      BUGFIX: 'text-blue-600 bg-blue-50 border-blue-200',
      PERFORMANCE: 'text-purple-600 bg-purple-50 border-purple-200',
      ENHANCEMENT: 'text-gray-600 bg-gray-50 border-gray-200',
      OTHER: 'text-gray-600 bg-gray-50 border-gray-200',
      DOCS: 'text-gray-600 bg-gray-50 border-gray-200',
      DEPENDENCY: 'text-gray-600 bg-gray-50 border-gray-200',
      REFACTOR: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="divide-y divide-gray-100">
      {changes.map(change => (
        <div 
          key={change.id}
          className="group cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={() => onChangeSelect(change)}
        >
          <div className="px-4 py-4">
            <div className="flex items-start gap-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-medium text-gray-500">
                    [{repoUrl.split('/').pop()}]
                  </span>
                  <span className="font-medium text-gray-900">
                    {change.description}
                  </span>
                </div>
                
                {change.whatsNew && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {change.whatsNew}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                    <span>{change.author}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <span>
                      {new Date(change.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
                      />
                    </svg>
                    <span className="font-mono text-xs">{change.sha.slice(0, 7)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {change.type && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs 
                    font-medium border ${getTypeColor(change.type)}`}>
                    {change.type.toLowerCase()}
                  </span>
                )}
                <svg 
                  className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 