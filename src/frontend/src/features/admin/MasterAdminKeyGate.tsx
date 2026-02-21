import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyMasterAdminKey } from '../../hooks/useQueries';
import { AlertCircle, Lock } from 'lucide-react';

interface MasterAdminKeyGateProps {
  onUnlock: () => void;
  isUnlocked: boolean;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export function MasterAdminKeyGate({ onUnlock, isUnlocked }: MasterAdminKeyGateProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const verifyKey = useVerifyMasterAdminKey();

  console.log('[MasterAdminKeyGate] Component rendered. isUnlocked:', isUnlocked);

  // Track user activity
  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (!isUnlocked) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isUnlocked, handleActivity]);

  // Check for inactivity timeout
  useEffect(() => {
    if (!isUnlocked) return;

    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        console.log('[MasterAdminKeyGate] Inactivity timeout reached. Locking admin portal.');
        window.location.reload(); // Force reload to lock the portal
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isUnlocked, lastActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedKey = key.trim();
    if (!trimmedKey) {
      setError('Please enter the Master Admin Key');
      return;
    }

    console.log('[MasterAdminKeyGate] Verifying key...');

    try {
      const isValid = await verifyKey.mutateAsync(trimmedKey);
      console.log('[MasterAdminKeyGate] Key verification result:', isValid);

      if (isValid) {
        console.log('[MasterAdminKeyGate] Key verified successfully. Unlocking admin portal.');
        onUnlock();
        setKey('');
      } else {
        console.log('[MasterAdminKeyGate] Key verification failed. Invalid key.');
        setError('Invalid Master Admin Key. Please try again.');
      }
    } catch (err: any) {
      console.error('[MasterAdminKeyGate] Error verifying key:', err);
      setError(`Verification failed: ${err.message || 'Unknown error'}`);
    }
  };

  if (isUnlocked) {
    console.log('[MasterAdminKeyGate] Admin portal is unlocked. Rendering null.');
    return null;
  }

  console.log('[MasterAdminKeyGate] Admin portal is locked. Rendering key entry form.');

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-6 w-6 text-primary" />
            <CardTitle>Admin Portal Access</CardTitle>
          </div>
          <CardDescription>Enter the Master Admin Key to access admin functions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminKey">Master Admin Key</Label>
              <Input
                id="adminKey"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter key"
                disabled={verifyKey.isPending}
                autoFocus
              />
              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Default key format: <code className="bg-muted px-1 py-0.5 rounded">7vX#2kL!m9$Q</code>
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={verifyKey.isPending}>
              {verifyKey.isPending ? 'Verifying...' : 'Unlock Admin Portal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
