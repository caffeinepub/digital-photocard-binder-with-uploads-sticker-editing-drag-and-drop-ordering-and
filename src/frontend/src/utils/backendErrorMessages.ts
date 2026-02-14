/**
 * Utility for normalizing backend error messages into user-friendly text.
 */

export interface NormalizedError {
  userMessage: string;
  debugMessage: string;
}

/**
 * Detect if an error is a binder limit enforcement error.
 */
function isBinderLimitError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = error instanceof Error ? error.message : String(error);
  
  return (
    errorString.includes('Binder limit reached') ||
    errorString.includes('binder limit') ||
    errorString.includes('Upgrade your subscription to add more binders')
  );
}

/**
 * Normalize a backend error into user-friendly and debug messages.
 * @param error The error thrown by the backend
 * @param planName The user's current plan name (e.g., "Free", "Subscriber")
 * @param maxBinders The maximum number of binders allowed on the current plan
 * @param isFree Whether the user is on the free plan
 * @returns Normalized error with user-friendly and debug messages
 */
export function normalizeBackendError(
  error: unknown,
  planName: string,
  maxBinders: number,
  isFree: boolean
): NormalizedError {
  const debugMessage = error instanceof Error ? error.message : String(error);
  
  // Check if this is a binder limit error
  if (isBinderLimitError(error)) {
    const upgradeHint = isFree 
      ? ' Upgrade to Subscriber to get up to 5 binders, or delete an existing binder to create a new one.'
      : ' Delete an existing binder to create a new one.';
    
    return {
      userMessage: `You've reached the limit of ${maxBinders} binders on the ${planName} plan.${upgradeHint}`,
      debugMessage,
    };
  }
  
  // Generic error fallback
  return {
    userMessage: 'Failed to create binder. Please try again.',
    debugMessage,
  };
}
