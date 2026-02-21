import { useState, useEffect } from 'react';
import { useGetAdminContentSettings, useUpdateAdminContentSettings, useUpdateMasterAdminKey } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, CheckCircle, AlertCircle, Image as ImageIcon, Lock, Key } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import type { AdminContentSettings } from '../../backend';

interface ContentManagerPanelProps {
  unlocked: boolean;
}

export default function ContentManagerPanel({ unlocked }: ContentManagerPanelProps) {
  const { data: settings, isLoading, error, refetch } = useGetAdminContentSettings();
  const updateMutation = useUpdateAdminContentSettings();
  const updateKeyMutation = useUpdateMasterAdminKey();

  const [termsText, setTermsText] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ logo?: number; background?: number }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Master Admin Key change state
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [keyChangeSuccess, setKeyChangeSuccess] = useState(false);
  const [keyChangeError, setKeyChangeError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setTermsText(settings.termsAndConditions);
      if (settings.logo) {
        setLogoPreview(settings.logo.getDirectURL());
      }
      if (settings.background) {
        setBackgroundPreview(settings.background.getDirectURL());
      }
    }
  }, [settings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!unlocked) return;
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!unlocked) return;
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      const reader = new FileReader();
      reader.onload = () => setBackgroundPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!unlocked) return;
    
    setSaveSuccess(false);
    setSaveError(null);
    setUploadProgress({});

    try {
      let logoBlob = settings?.logo;
      let backgroundBlob = settings?.background;

      // Upload logo if changed
      if (logoFile) {
        const logoBytes = new Uint8Array(await logoFile.arrayBuffer()) as Uint8Array<ArrayBuffer>;
        logoBlob = ExternalBlob.fromBytes(logoBytes).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, logo: percentage }));
        });
      }

      // Upload background if changed
      if (backgroundFile) {
        const backgroundBytes = new Uint8Array(await backgroundFile.arrayBuffer()) as Uint8Array<ArrayBuffer>;
        backgroundBlob = ExternalBlob.fromBytes(backgroundBytes).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, background: percentage }));
        });
      }

      const updatedSettings: AdminContentSettings = {
        logo: logoBlob,
        background: backgroundBlob,
        termsAndConditions: termsText,
        masterAdminKey: settings?.masterAdminKey,
      };

      await updateMutation.mutateAsync(updatedSettings);
      setSaveSuccess(true);
      setLogoFile(null);
      setBackgroundFile(null);
      setUploadProgress({});
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings');
      console.error('Save error:', err);
    }
  };

  const handleKeyChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlocked) return;

    setKeyChangeSuccess(false);
    setKeyChangeError(null);

    if (newKey !== confirmKey) {
      setKeyChangeError('Keys do not match. Please try again.');
      return;
    }

    if (newKey.length < 8) {
      setKeyChangeError('Key must be at least 8 characters long.');
      return;
    }

    try {
      await updateKeyMutation.mutateAsync(newKey);
      setKeyChangeSuccess(true);
      setNewKey('');
      setConfirmKey('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setKeyChangeSuccess(false), 3000);
    } catch (err: any) {
      setKeyChangeError(err.message || 'Failed to update master admin key');
      console.error('Key change error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-binder-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load content settings. <Button variant="link" onClick={() => refetch()} className="p-0 h-auto">Retry</Button>
        </AlertDescription>
      </Alert>
    );
  }

  const isSaving = updateMutation.isPending;
  const hasChanges = logoFile !== null || backgroundFile !== null || termsText !== settings?.termsAndConditions;

  return (
    <div className="space-y-6">
      {!unlocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Content editing is locked. Enter the Master Admin Key to make changes.
          </AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully! Changes are now live.
          </AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Master Admin Key Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Master Admin Key
          </CardTitle>
          <CardDescription>Update the master key required to access admin controls</CardDescription>
        </CardHeader>
        <CardContent>
          {keyChangeSuccess && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Master Admin Key updated successfully! Use the new key on your next login.
              </AlertDescription>
            </Alert>
          )}

          {keyChangeError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{keyChangeError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleKeyChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-key">New Master Admin Key</Label>
              <Input
                id="new-key"
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Enter new key (min 8 characters)"
                disabled={!unlocked || updateKeyMutation.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-key">Confirm New Key</Label>
              <Input
                id="confirm-key"
                type="password"
                value={confirmKey}
                onChange={(e) => setConfirmKey(e.target.value)}
                placeholder="Re-enter new key"
                disabled={!unlocked || updateKeyMutation.isPending}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={!unlocked || updateKeyMutation.isPending || !newKey || !confirmKey}
            >
              {updateKeyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Key...
                </>
              ) : (
                'Update Master Admin Key'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
          <CardDescription>Update the terms and conditions text displayed to users</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={termsText}
            onChange={(e) => unlocked && setTermsText(e.target.value)}
            placeholder="Enter terms and conditions..."
            className="min-h-[200px] font-mono text-sm"
            disabled={!unlocked || isSaving}
            readOnly={!unlocked}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo Image</CardTitle>
          <CardDescription>Upload a logo to display in the app header</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logoPreview && (
            <div className="relative w-32 h-32 border border-binder-border rounded-lg overflow-hidden bg-binder-page">
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              disabled={!unlocked || isSaving}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('logo-upload')?.click()}
              disabled={!unlocked || isSaving}
            >
              <Upload className="w-4 h-4 mr-2" />
              {logoFile ? 'Change Logo' : 'Upload Logo'}
            </Button>
            {logoFile && <span className="text-sm text-binder-text-muted">{logoFile.name}</span>}
          </div>
          {uploadProgress.logo !== undefined && uploadProgress.logo < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress.logo} />
              <p className="text-sm text-binder-text-muted">Uploading logo: {uploadProgress.logo}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Background Image</CardTitle>
          <CardDescription>Upload a background image for binder frames</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {backgroundPreview && (
            <div className="relative w-full h-48 border border-binder-border rounded-lg overflow-hidden bg-binder-page">
              <img src={backgroundPreview} alt="Background preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              id="background-upload"
              type="file"
              accept="image/*"
              onChange={handleBackgroundChange}
              disabled={!unlocked || isSaving}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('background-upload')?.click()}
              disabled={!unlocked || isSaving}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {backgroundFile ? 'Change Background' : 'Upload Background'}
            </Button>
            {backgroundFile && <span className="text-sm text-binder-text-muted">{backgroundFile.name}</span>}
          </div>
          {uploadProgress.background !== undefined && uploadProgress.background < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress.background} />
              <p className="text-sm text-binder-text-muted">Uploading background: {uploadProgress.background}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!unlocked || !hasChanges || isSaving}
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save All Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
