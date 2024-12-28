interface RepositoryInputProps {
  repoUrl: string;
  onChange: (value: string) => void;
}

export function RepositoryInput({ repoUrl, onChange }: RepositoryInputProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="repoUrl" className="block text-base font-medium text-gray-900 mb-2">
          Repository URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <input
            id="repoUrl"
            type="url"
            required
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 
              placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              transition duration-150 ease-in-out"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Enter the full URL of your GitHub repository
        </p>
      </div>
    </div>
  );
} 