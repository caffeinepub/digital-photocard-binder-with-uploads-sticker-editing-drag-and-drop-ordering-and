import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useGetLayoutPresets,
  useGetUserLayout,
  useUpdateUserLayout,
  useGetDefaultLayout,
} from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileSettingsDialog({ open, onOpenChange }: ProfileSettingsDialogProps) {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: presets, isLoading: presetsLoading } = useGetLayoutPresets();
  const { data: userLayout, isLoading: layoutLoading } = useGetUserLayout();
  const { data: defaultLayout } = useGetDefaultLayout();
  const saveProfile = useSaveCallerUserProfile();
  const updateLayout = useUpdateUserLayout();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLayout, setSelectedLayout] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || profile.name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  useEffect(() => {
    if (userLayout) {
      setSelectedLayout(userLayout);
    } else if (defaultLayout) {
      setSelectedLayout(defaultLayout);
    }
  }, [userLayout, defaultLayout]);

  const handleSave = async () => {
    if (!profile) return;

    try {
      // Save profile
      await saveProfile.mutateAsync({
        name: profile.name,
        displayName: displayName.trim() || undefined,
        email: email.trim() || undefined,
        avatarUrl: profile.avatarUrl,
      });

      // Save layout preference if changed
      if (selectedLayout && selectedLayout !== userLayout) {
        await updateLayout.mutateAsync(selectedLayout);
      }

      toast.success('Settings saved successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to save settings: ${error.message}`);
    }
  };

  const isLoading = profileLoading || presetsLoading || layoutLoading;
  const isSaving = saveProfile.isPending || updateLayout.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>Update your profile information and preferences</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="binderView">Binder View</Label>
              <Select
                value={selectedLayout}
                onValueChange={setSelectedLayout}
                disabled={isSaving || !presets || presets.length === 0}
              >
                <SelectTrigger id="binderView">
                  <SelectValue placeholder="Select grid layout" />
                </SelectTrigger>
                <SelectContent>
                  {presets && presets.length > 0 ? (
                    presets.map((preset) => (
                      <SelectItem key={preset} value={preset}>
                        {preset}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="3x3" disabled>
                      No layouts available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how cards are displayed in your binder
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!displayName.trim() || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
