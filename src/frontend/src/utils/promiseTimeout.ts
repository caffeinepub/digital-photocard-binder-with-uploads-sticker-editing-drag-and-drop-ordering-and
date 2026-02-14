/**
 * Wraps a promise with a timeout to prevent indefinite hanging
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds (default: 30 seconds)
 * @param errorMessage Custom error message for timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = 'Request timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
