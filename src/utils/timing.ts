export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const RATE_LIMIT = {
  maxRetries: 3,
  baseDelay: 5000,
  batchSize: 1,
  batchDelay: 5000,
  requestDelay: 5000
}; 