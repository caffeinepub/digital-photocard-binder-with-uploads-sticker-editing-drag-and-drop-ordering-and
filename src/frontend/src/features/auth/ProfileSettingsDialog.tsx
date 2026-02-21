import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetLayoutPresets, useGetUserLayout, useUpdateUserLayout, useGetDefaultLayout } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileSettingsDialog({ open, onOpenChange }: ProfileSettingsDialogProps) {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { data: layoutPresets = [], isLoading: presetsLoading } = useGetLayoutPresets();
  const { data: currentLayout, isLoading: layoutLoading } = useGetUserLayout();
  const { data: defaultLayout } = useGetDefaultLayout();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const { mutate: updateLayout, isPending: layoutPending } = useUpdateUserLayout();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLayout, setSelectedLayout] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.displayName || userProfile.name);
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  useEffect(() => {
    // Set the selected layout to current user layout or default
    const layoutToUse = currentLayout || defaultLayout || '3x3';
    setSelectedLayout(layoutToUse);
  }, [currentLayout, defaultLayout]);

  const handleSave = () => {
    if (name.trim() && userProfile) {
      const layoutChanged = selectedLayout && selectedLayout !== (currentLayout || defaultLayout);
      
      // Save profile
      saveProfile(
        {
          name: userProfile.name,
          displayName: name.trim(),
          email: email.trim() || undefined,
          avatarUrl: userProfile.avatarUrl,
        },
        {
          onSuccess: () => {
            // Save layout preference if changed
            if (layoutChanged) {
              updateLayout(selectedLayout, {
                onSuccess: () => {
                  toast.success('Settings saved successfully');
                  onOpenChange(false);
                },
                onError: (error) => {
                  console.error('Layout update failed:', error);
                  toast.error('Failed to update layout preference');
                },
              });
            } else {
              toast.success('Profile updated successfully');
              onOpenChange(false);
            }
          },
          onError: (error) => {
            console.error('Profile save failed:', error);
            toast.error('Failed to save profile');
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>Update your profile information and preferences</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-binder-accent" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Display Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="binder-view">Binder View</Label>
              {presetsLoading || layoutLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-binder-accent" />
                </div>
              ) : (
                <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                  <SelectTrigger id="binder-view">
                    <SelectValue placeholder="Select grid layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {layoutPresets.map((preset) => (
                      <SelectItem key={preset} value={preset}>
                        {preset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-binder-text-muted">
                Choose how many cards appear per page in your binder
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending || layoutPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isPending || layoutPending}>
            {isPending || layoutPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
