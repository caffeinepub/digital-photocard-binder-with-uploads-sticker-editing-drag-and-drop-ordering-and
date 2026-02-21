import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GlobalLoadingGateProps {
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  loadingMessage?: string;
  errorTitle?: string;
}

/**
 * Global loading and error gate component
 * Shows loading spinner, error state with retry, or renders children
 */
export default function GlobalLoadingGate({
  isLoading,
  error,
  onRetry,
  loadingMessage = 'Loading your binders...',
  errorTitle = 'Unable to load your data',
}: GlobalLoadingGateProps) {
  console.log('[GlobalLoadingGate] State:', {
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
  });

  if (error) {
    console.error('[GlobalLoadingGate] Displaying error state:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-binder-dark px-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="rounded-2xl border-2 mb-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              <strong className="block mb-2">{errorTitle}</strong>
              <p className="text-sm mb-4">
                {error.message || 'An unexpected error occurred. Please try again.'}
              </p>
              <details className="text-xs opacity-70 mt-2">
                <summary className="cursor-pointer">Technical details</summary>
                <pre className="mt-2 p-2 bg-black/20 rounded overflow-auto">
                  {error.stack || error.toString()}
                </pre>
              </details>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={onRetry}
              className="w-full bg-binder-accent hover:bg-binder-accent-hover text-white rounded-xl h-12"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            
            <p className="text-center text-sm text-binder-text-muted">
              If the problem persists, try refreshing the page or check your internet connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    console.log('[GlobalLoadingGate] Displaying loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-binder-dark">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-binder-accent mx-auto mb-4" />
          <p className="text-binder-text-muted">{loadingMessage}</p>
          <p className="text-xs text-binder-text-muted/60 mt-2">
            This may take a few moments...
          </p>
        </div>
      </div>
    );
  }

  console.log('[GlobalLoadingGate] No loading or error, rendering children');
  return null;
}
