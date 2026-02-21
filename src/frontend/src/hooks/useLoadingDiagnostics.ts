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
  thresholdMs: number = 3000
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
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('[Loading Diagnostics] App is taking longer than expected to load');
      console.log('───────────────────────────────────────────────────────');
      
      if (!state.actorReady) {
        console.log('  ⏳ Waiting for backend actor initialization');
        console.log('     → This connects to the Internet Computer backend');
      } else if (state.profileError) {
        console.log('  ❌ Profile fetch failed');
        console.log('     → Check network connection');
        console.log('     → Verify you are logged in with Internet Identity');
      } else if (state.profileLoading) {
        console.log('  ⏳ Fetching user profile from backend');
        console.log('     → This should complete within a few seconds');
      } else if (state.bindersError) {
        console.log('  ❌ Binders fetch failed');
        console.log('     → Check network connection');
        console.log('     → Try refreshing the page');
      } else if (state.bindersLoading) {
        console.log('  ⏳ Fetching binders from backend');
        console.log('     → This may take longer if you have many binders');
      }
      
      console.log('───────────────────────────────────────────────────────');
      console.log('  💡 If this persists:');
      console.log('     1. Refresh the page (Ctrl+R or Cmd+R)');
      console.log('     2. Check your internet connection');
      console.log('     3. Clear browser cache and try again');
      console.log('═══════════════════════════════════════════════════════');
    }, thresholdMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, thresholdMs]);
}
