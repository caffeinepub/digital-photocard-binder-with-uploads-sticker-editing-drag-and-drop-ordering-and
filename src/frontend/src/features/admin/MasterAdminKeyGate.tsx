import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useVerifyMasterAdminKey } from '../../hooks/useQueries';

interface MasterAdminKeyGateProps {
  children: (unlocked: boolean) => React.ReactNode;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function MasterAdminKeyGate({ children }: MasterAdminKeyGateProps) {
  const [keyInput, setKeyInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const verifyMutation = useVerifyMasterAdminKey();

  // Track user activity
  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (!unlocked) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [unlocked, handleActivity]);

  // Check for inactivity timeout
  useEffect(() => {
    if (!unlocked) return;

    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        setUnlocked(false);
        setKeyInput('');
        setError(false);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [unlocked, lastActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    try {
      const isValid = await verifyMutation.mutateAsync(keyInput);
      if (isValid) {
        setUnlocked(true);
        setLastActivity(Date.now());
      } else {
        setError(true);
        setKeyInput('');
      }
    } catch (err) {
      setError(true);
      setKeyInput('');
      console.error('Key verification error:', err);
    }
  };

  if (unlocked) {
    return <>{children(true)}</>;
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-binder-accent/20 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-binder-accent" />
            </div>
            <div>
              <CardTitle>Master Admin Key Required</CardTitle>
              <CardDescription>Enter the master key to unlock admin controls</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Incorrect master key. Please try again.</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="master-key">Master Admin Key</Label>
              <Input
                id="master-key"
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Enter master key"
                autoFocus
                required
                disabled={verifyMutation.isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Unlock Admin Portal'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
