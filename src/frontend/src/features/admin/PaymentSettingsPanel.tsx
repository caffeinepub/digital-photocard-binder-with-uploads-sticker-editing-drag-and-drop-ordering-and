import { useState } from 'react';
import { useSaveStripeKeys } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentSettingsPanelProps {
  unlocked: boolean;
}

export default function PaymentSettingsPanel({ unlocked }: PaymentSettingsPanelProps) {
  const saveKeysMutation = useSaveStripeKeys();

  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateKeys = (): boolean => {
    setValidationError(null);

    if (!publishableKey.trim() || !secretKey.trim()) {
      setValidationError('Both keys are required');
      return false;
    }

    if (!publishableKey.startsWith('pk_')) {
      setValidationError('Publishable key must start with "pk_"');
      return false;
    }

    if (!secretKey.startsWith('sk_')) {
      setValidationError('Secret key must start with "sk_"');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!unlocked) return;

    if (!validateKeys()) {
      return;
    }

    try {
      await saveKeysMutation.mutateAsync({
        publishableKey: publishableKey.trim(),
        secretKey: secretKey.trim(),
      });

      toast.success('Stripe keys saved successfully', {
        description: 'Payment integration is now configured',
      });

      // Clear the input fields after successful save
      setPublishableKey('');
      setSecretKey('');
      setValidationError(null);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save Stripe keys';
      toast.error('Save failed', {
        description: errorMessage,
      });
    }
  };

  const isFormValid = publishableKey.trim() !== '' && secretKey.trim() !== '';
  const isSaving = saveKeysMutation.isPending;

  if (!unlocked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Integration Settings
          </CardTitle>
          <CardDescription>Configure Stripe payment keys for checkout functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please unlock the admin portal to manage payment settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Integration Settings
        </CardTitle>
        <CardDescription>
          Configure Stripe payment keys for checkout functionality. Keys are stored securely in encrypted canister storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publishable-key">Stripe Publishable Key</Label>
            <Input
              id="publishable-key"
              type="text"
              placeholder="pk_test_..."
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              disabled={isSaving}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your Stripe publishable key (starts with pk_)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret-key">Stripe Secret Key</Label>
            <Input
              id="secret-key"
              type="password"
              placeholder="sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              disabled={isSaving}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your Stripe secret key (starts with sk_) - masked for security
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Note:</strong> The secret key is stored in encrypted canister storage and is never exposed to the frontend or console logs. Only backend payment processing functions have access to it.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
