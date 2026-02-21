import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  useGetLayoutPresets,
  useAddLayoutPreset,
  useRemoveLayoutPreset,
  useGetDefaultLayout,
  useSetDefaultLayout,
} from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Grid3x3 } from 'lucide-react';

interface LayoutPresetsPanelProps {
  isUnlocked: boolean;
}

export function LayoutPresetsPanel({ isUnlocked }: LayoutPresetsPanelProps) {
  const { data: presets, isLoading: presetsLoading } = useGetLayoutPresets();
  const { data: defaultLayout, isLoading: defaultLoading } = useGetDefaultLayout();
  const addPreset = useAddLayoutPreset();
  const removePreset = useRemoveLayoutPreset();
  const setDefault = useSetDefaultLayout();

  const [newPreset, setNewPreset] = useState('');

  const validatePresetFormat = (preset: string): boolean => {
    const pattern = /^\d+x\d+$/;
    return pattern.test(preset);
  };

  const handleAddPreset = async () => {
    const trimmed = newPreset.trim();
    if (!trimmed) {
      toast.error('Please enter a preset value');
      return;
    }

    if (!validatePresetFormat(trimmed)) {
      toast.error('Invalid format. Use format like "3x3" or "4x3"');
      return;
    }

    try {
      await addPreset.mutateAsync(trimmed);
      toast.success(`Preset "${trimmed}" added successfully`);
      setNewPreset('');
    } catch (error: any) {
      toast.error(`Failed to add preset: ${error.message}`);
    }
  };

  const handleRemovePreset = async (preset: string) => {
    try {
      await removePreset.mutateAsync(preset);
      toast.success(`Preset "${preset}" removed successfully`);
    } catch (error: any) {
      toast.error(`Failed to remove preset: ${error.message}`);
    }
  };

  const handleSetDefault = async (preset: string) => {
    try {
      await setDefault.mutateAsync(preset);
      toast.success(`Default layout set to "${preset}"`);
    } catch (error: any) {
      toast.error(`Failed to set default layout: ${error.message}`);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Please unlock the admin portal to access layout options.</p>
      </div>
    );
  }

  if (presetsLoading || defaultLoading) {
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
            <Grid3x3 className="h-5 w-5 text-primary" />
            <CardTitle>Default Layout</CardTitle>
          </div>
          <CardDescription>Set the default grid layout for new users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultLayout">Default Layout Preset</Label>
            <Select
              value={defaultLayout || '3x3'}
              onValueChange={handleSetDefault}
              disabled={setDefault.isPending}
            >
              <SelectTrigger id="defaultLayout">
                <SelectValue placeholder="Select default layout" />
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
                    No presets available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              New users will see this layout when they first sign up
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Layout Presets</CardTitle>
          <CardDescription>Add or remove grid layout options available to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPreset">Add New Preset</Label>
            <div className="flex gap-2">
              <Input
                id="newPreset"
                type="text"
                value={newPreset}
                onChange={(e) => setNewPreset(e.target.value)}
                placeholder="e.g., 1x1, 5x4, 6x2"
                disabled={addPreset.isPending}
              />
              <Button onClick={handleAddPreset} disabled={addPreset.isPending} className="gap-2">
                {addPreset.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: [columns]x[rows] (e.g., "3x3" for 3 columns and 3 rows)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Current Presets</Label>
            <div className="flex flex-wrap gap-2">
              {presets && presets.length > 0 ? (
                presets.map((preset) => (
                  <Badge key={preset} variant="secondary" className="gap-2 pr-1">
                    {preset}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemovePreset(preset)}
                      disabled={removePreset.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No presets available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
