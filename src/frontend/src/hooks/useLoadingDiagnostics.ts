import { useEffect, useRef } from 'react';

interface LoadingState {
  actorReady: boolean;
  profileLoading: boolean;
  profileError: boolean;
  bindersLoading?: boolean;
  bindersError?: boolean;
}

/**
 * Logs diagnostic information when loading persists beyond a threshold
 * Helps identify which step is blocking the app without exposing sensitive data
 */
export function useLoadingDiagnostics(
  state: LoadingState,
  thresholdMs: number = 5000
) {
  const hasLoggedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset if we're no longer in a loading state
    const isLoading = !state.actorReady || state.profileLoading || state.bindersLoading;
    
    if (!isLoading) {
      hasLoggedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Only log once per loading session
    if (hasLoggedRef.current) return;

    timeoutRef.current = setTimeout(() => {
      hasLoggedRef.current = true;
      
      console.log('[Loading Diagnostics] App is taking longer than expected to load');
      
      if (!state.actorReady) {
        console.log('  → Waiting for backend actor initialization');
      } else if (state.profileError) {
        console.log('  → Profile fetch failed - check network connection');
      } else if (state.profileLoading) {
        console.log('  → Fetching user profile from backend');
      } else if (state.bindersError) {
        console.log('  → Binders fetch failed - check network connection');
      } else if (state.bindersLoading) {
        console.log('  → Fetching binders from backend');
      }
      
      console.log('  Note: If this persists, try refreshing the page or checking your connection');
    }, thresholdMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, thresholdMs]);
}
