interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterChange: (value: string) => void;
}

export function SearchFilters({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by description, author, or type..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 
            placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <select
        value={filterType}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 
          appearance-none cursor-pointer min-w-[140px] focus:ring-2 focus:ring-blue-500 
          focus:border-transparent"
      >
        <option value="ALL">All changes</option>
        <option value="FEATURE">Features</option>
        <option value="BUGFIX">Bug fixes</option>
        <option value="BREAKING">Breaking</option>
        <option value="SECURITY">Security</option>
        <option value="PERFORMANCE">Performance</option>
        <option value="DEPENDENCY">Dependencies</option>
        <option value="REFACTOR">Refactors</option>
      </select>
    </div>
  );
} 