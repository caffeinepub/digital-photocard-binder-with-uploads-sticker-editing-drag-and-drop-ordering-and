import { useState } from 'react';
import {
  useGetLayoutPresets,
  useGetDefaultLayout,
  useAddLayoutPreset,
  useRemoveLayoutPreset,
  useSetDefaultLayout,
} from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, CheckCircle, AlertCircle, Grid3x3, Lock } from 'lucide-react';

interface LayoutPresetsPanelProps {
  unlocked: boolean;
}

export default function LayoutPresetsPanel({ unlocked }: LayoutPresetsPanelProps) {
  const { data: presets = [], isLoading: presetsLoading, error: presetsError, refetch: refetchPresets } = useGetLayoutPresets();
  const { data: defaultLayout, isLoading: defaultLoading, error: defaultError, refetch: refetchDefault } = useGetDefaultLayout();
  const addPresetMutation = useAddLayoutPreset();
  const removePresetMutation = useRemoveLayoutPreset();
  const setDefaultMutation = useSetDefaultLayout();

  const [newPreset, setNewPreset] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [removeSuccess, setRemoveSuccess] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [defaultSuccess, setDefaultSuccess] = useState(false);
  const [defaultChangeError, setDefaultChangeError] = useState<string | null>(null);

  const validatePresetFormat = (preset: string): boolean => {
    const pattern = /^\d+x\d+$/;
    return pattern.test(preset);
  };

  const handleAddPreset = async () => {
    if (!unlocked) return;

    setAddSuccess(false);
    setAddError(null);

    if (!newPreset.trim()) {
      setAddError('Please enter a preset value');
      return;
    }

    if (!validatePresetFormat(newPreset.trim())) {
      setAddError('Invalid format. Use format like "3x3" or "4x3"');
      return;
    }

    if (presets.includes(newPreset.trim())) {
      setAddError('This preset already exists');
      return;
    }

    try {
      await addPresetMutation.mutateAsync(newPreset.trim());
      setAddSuccess(true);
      setNewPreset('');
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add preset');
      console.error('Add preset error:', err);
    }
  };

  const handleRemovePreset = async (preset: string) => {
    if (!unlocked) return;

    setRemoveSuccess(false);
    setRemoveError(null);

    if (preset === defaultLayout) {
      setRemoveError('Cannot remove the default layout. Set a different default first.');
      return;
    }

    try {
      await removePresetMutation.mutateAsync(preset);
      setRemoveSuccess(true);
      setTimeout(() => setRemoveSuccess(false), 3000);
    } catch (err: any) {
      setRemoveError(err.message || 'Failed to remove preset');
      console.error('Remove preset error:', err);
    }
  };

  const handleSetDefault = async (preset: string) => {
    if (!unlocked) return;

    setDefaultSuccess(false);
    setDefaultChangeError(null);

    try {
      await setDefaultMutation.mutateAsync(preset);
      setDefaultSuccess(true);
      setTimeout(() => setDefaultSuccess(false), 3000);
    } catch (err: any) {
      setDefaultChangeError(err.message || 'Failed to set default layout');
      console.error('Set default error:', err);
    }
  };

  if (presetsLoading || defaultLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-binder-accent" />
      </div>
    );
  }

  if (presetsError || defaultError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load layout settings.{' '}
          <Button
            variant="link"
            onClick={() => {
              refetchPresets();
              refetchDefault();
            }}
            className="p-0 h-auto"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {!unlocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Layout management is locked. Enter the Master Admin Key to make changes.
          </AlertDescription>
        </Alert>
      )}

      {addSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Preset added successfully! Users can now select this layout.
          </AlertDescription>
        </Alert>
      )}

      {addError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{addError}</AlertDescription>
        </Alert>
      )}

      {removeSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Preset removed successfully!
          </AlertDescription>
        </Alert>
      )}

      {removeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{removeError}</AlertDescription>
        </Alert>
      )}

      {defaultSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Default layout updated successfully! New users will see this layout.
          </AlertDescription>
        </Alert>
      )}

      {defaultChangeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{defaultChangeError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Default Layout
          </CardTitle>
          <CardDescription>
            Set the default grid layout for new users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-layout">Default Binder View</Label>
            <Select
              value={defaultLayout || ''}
              onValueChange={handleSetDefault}
              disabled={!unlocked || setDefaultMutation.isPending}
            >
              <SelectTrigger id="default-layout">
                <SelectValue placeholder="Select default layout" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-binder-text-muted">
              This layout will be assigned to new users when they first sign up
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Grid Preset</CardTitle>
          <CardDescription>
            Create new grid layout options for users to choose from
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-preset">Grid Layout (e.g., 3x3, 4x3, 5x4)</Label>
              <Input
                id="new-preset"
                value={newPreset}
                onChange={(e) => setNewPreset(e.target.value)}
                placeholder="e.g., 1x1, 2x2, 3x3"
                disabled={!unlocked || addPresetMutation.isPending}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddPreset}
                disabled={!unlocked || !newPreset.trim() || addPresetMutation.isPending}
              >
                {addPresetMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Preset
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-binder-text-muted">
            Format: [columns]x[rows] (e.g., "3x3" for 9 cards per page)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Grid Presets</CardTitle>
          <CardDescription>
            Manage the grid layout options available to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {presets.length === 0 ? (
            <p className="text-sm text-binder-text-muted text-center py-8">
              No presets available. Add your first preset above.
            </p>
          ) : (
            <div className="space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset}
                  className="flex items-center justify-between p-3 border border-binder-border rounded-lg bg-binder-page/30"
                >
                  <div className="flex items-center gap-3">
                    <Grid3x3 className="w-5 h-5 text-binder-accent" />
                    <div>
                      <p className="font-medium text-binder-text">{preset}</p>
                      <p className="text-xs text-binder-text-muted">
                        {preset.split('x').reduce((a, b) => Number(a) * Number(b), 1)} cards per page
                        {preset === defaultLayout && ' • Default'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePreset(preset)}
                    disabled={!unlocked || removePresetMutation.isPending || preset === defaultLayout}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
