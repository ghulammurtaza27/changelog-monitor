interface DateRangeSelectorProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
}

export function DateRangeSelector({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange
}: DateRangeSelectorProps) {
  // Get today's date for max date validation
  const today = new Date().toISOString().split('T')[0];

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFromDate = e.target.value;
    onFromDateChange(newFromDate);
    
    // If to date is before from date, update to date
    if (toDate && new Date(newFromDate) > new Date(toDate)) {
      onToDateChange(newFromDate);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Date Range</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">
            From
          </label>
          <input
            type="date"
            id="fromDate"
            name="fromDate"
            max={today}
            value={fromDate}
            onChange={handleFromDateChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">
            To
          </label>
          <input
            type="date"
            id="toDate"
            name="toDate"
            min={fromDate}
            max={today}
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Select a date range to filter commits. Leave empty to include all commits.
      </p>
    </div>
  );
} 