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

interface ChangeDetailsProps {
  change: Change;
  repoUrl?: string;
}

export function ChangeDetails({ change, repoUrl }: ChangeDetailsProps) {
  const getTypeColor = (type: string) => {
    const colors = {
      BREAKING: 'text-red-600 bg-red-50 border-red-200',
      SECURITY: 'text-orange-600 bg-orange-50 border-orange-200',
      FEATURE: 'text-green-600 bg-green-50 border-green-200',
      BUGFIX: 'text-blue-600 bg-blue-50 border-blue-200',
      PERFORMANCE: 'text-purple-600 bg-purple-50 border-purple-200',
      DEPENDENCY: 'text-teal-600 bg-teal-50 border-teal-200',
      REFACTOR: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getCommitUrl = () => {
    if (!repoUrl) return null;
    return `${repoUrl}/commit/${change.sha}`;
  };

  const commitUrl = getCommitUrl();

  return (
    <div className="p-6 overflow-y-auto">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(change.type)}`}>
                {change.type.toLowerCase()}
              </span>
              <span className="text-sm text-gray-500">
                Commit {change.sha.slice(0, 7)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {change.description}
            </h3>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Technical Summary</h4>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{change.whatsNew}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Impact Analysis</h4>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{change.impact}</p>
          </div>

          {change.details && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Implementation Details</h4>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {change.details}
              </p>
            </div>
          )}
        </div>

        {/* Metadata Section */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Author</dt>
              <dd className="flex items-center gap-2 text-gray-900">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
                {change.author}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Date</dt>
              <dd className="flex items-center gap-2 text-gray-900">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                {new Date(change.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>

            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-500 mb-1">Commit Hash</dt>
              <dd className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
                  />
                </svg>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-900">
                  {change.sha}
                </code>
                {commitUrl && (
                  <a 
                    href={commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 
                      transition-colors ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                    View on GitHub
                  </a>
                )}
              </dd>
            </div>
          </dl>
        </div>

       
      </div>
    </div>
  );
} 