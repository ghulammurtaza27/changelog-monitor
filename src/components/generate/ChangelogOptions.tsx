interface ChangelogOptionsProps {
  hasBreakingChanges: boolean;
  hasSecurityChanges: boolean;
  onBreakingChangesChange: (value: boolean) => void;
  onSecurityChangesChange: (value: boolean) => void;
}

export function ChangelogOptions({
  hasBreakingChanges,
  hasSecurityChanges,
  onBreakingChangesChange,
  onSecurityChangesChange
}: ChangelogOptionsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Options</h3>
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={hasBreakingChanges}
            onChange={(e) => onBreakingChangesChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-gray-900 font-medium">Breaking changes only</span>
            <p className="text-sm text-gray-500">Only include changes marked as breaking</p>
          </div>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={hasSecurityChanges}
            onChange={(e) => onSecurityChangesChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-gray-900 font-medium">Security changes only</span>
            <p className="text-sm text-gray-500">Only include security-related changes</p>
          </div>
        </label>
      </div>
    </div>
  );
} 