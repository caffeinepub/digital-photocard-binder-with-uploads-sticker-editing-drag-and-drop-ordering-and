import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGetAdminContentSettings, useUpdateAdminContentSettings, useUpdateMasterAdminKey } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Key } from 'lucide-react';

interface ContentManagerPanelProps {
  isUnlocked: boolean;
}

export function ContentManagerPanel({ isUnlocked }: ContentManagerPanelProps) {
  const { data: settings, isLoading } = useGetAdminContentSettings();
  const updateSettings = useUpdateAdminContentSettings();
  const updateKey = useUpdateMasterAdminKey();

  const [termsText, setTermsText] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');

  React.useEffect(() => {
    if (settings) {
      setTermsText(settings.termsAndConditions);
    }
  }, [settings]);

  const handleSaveTerms = async () => {
    if (!settings) return;

    try {
      await updateSettings.mutateAsync({
        ...settings,
        termsAndConditions: termsText,
      });
      toast.success('Terms & Conditions updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update Terms & Conditions: ${error.message}`);
    }
  };

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newKey.trim()) {
      toast.error('Please enter a new Master Admin Key');
      return;
    }

    if (newKey !== confirmKey) {
      toast.error('Keys do not match. Please confirm your new key.');
      return;
    }

    try {
      await updateKey.mutateAsync(newKey.trim());
      toast.success('Master Admin Key updated successfully');
      setNewKey('');
      setConfirmKey('');
    } catch (error: any) {
      toast.error(`Failed to update Master Admin Key: ${error.message}`);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Please unlock the admin portal to access content management.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Master Admin Key</CardTitle>
          </div>
          <CardDescription>Update the Master Admin Key for portal access</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateKey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newKey">New Master Admin Key</Label>
              <Input
                id="newKey"
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Enter new key"
                disabled={updateKey.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmKey">Confirm New Key</Label>
              <Input
                id="confirmKey"
                type="password"
                value={confirmKey}
                onChange={(e) => setConfirmKey(e.target.value)}
                placeholder="Re-enter new key"
                disabled={updateKey.isPending}
              />
            </div>
            <Button type="submit" disabled={updateKey.isPending}>
              {updateKey.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Master Admin Key'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
          <CardDescription>Manage the Terms & Conditions text displayed to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions Text</Label>
            <Textarea
              id="terms"
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              placeholder="Enter terms and conditions..."
              rows={10}
              disabled={updateSettings.isPending}
            />
          </div>
          <Button onClick={handleSaveTerms} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Terms & Conditions'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
