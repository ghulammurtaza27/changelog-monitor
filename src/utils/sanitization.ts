export function sanitizeForDB(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
} 