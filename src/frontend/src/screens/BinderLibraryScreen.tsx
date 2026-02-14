import { useState } from 'react';
import { useGetBinders, useCreateBinder, useDeleteBinder, useGetSubscriptionStatus } from '../hooks/useQueries';
import { useLoadingDiagnostics } from '../hooks/useLoadingDiagnostics';
import { getDefaultTheme } from '../features/binders/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen, Trash2, Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getShopifyUpgradeUrl, isShopifyUpgradeConfigured } from '../config/subscription';
import { normalizeBackendError } from '../utils/backendErrorMessages';

interface BinderLibraryScreenProps {
  onOpenBinder: (binderId: string) => void;
}

export default function BinderLibraryScreen({ onOpenBinder }: BinderLibraryScreenProps) {
  const { data: binders = [], isLoading: bindersLoading, error: bindersError, refetch: refetchBinders } = useGetBinders();
  const { data: subscriptionStatus, isLoading: isLoadingSubscription, error: subscriptionError, refetch: refetchSubscription } = useGetSubscriptionStatus();
  const { mutate: createBinder, isPending: isCreating, error: createError } = useCreateBinder();
  const { mutate: deleteBinder, isPending: isDeleting } = useDeleteBinder();
  const [newBinderName, setNewBinderName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Loading diagnostics
  useLoadingDiagnostics({
    actorReady: true,
    profileLoading: false,
    profileError: false,
    bindersLoading,
    bindersError: !!bindersError,
  });

  // Determine max binders based on subscription status
  const maxBinders = subscriptionStatus === 'pro' ? 5 : 2;
  const isAtLimit = binders.length >= maxBinders;
  const isFree = subscriptionStatus === 'free';
  const planName = subscriptionStatus === 'pro' ? 'Subscriber' : 'Free';

  // Get Shopify upgrade URL
  const shopifyUpgradeUrl = getShopifyUpgradeUrl();
  const hasUpgradeUrl = isShopifyUpgradeConfigured();

  const handleCreateBinder = () => {
    if (newBinderName.trim() && !isAtLimit) {
      createBinder(
        { name: newBinderName.trim(), theme: getDefaultTheme() },
        {
          onSuccess: () => {
            setNewBinderName('');
            setIsDialogOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteBinder = (binderId: string) => {
    deleteBinder(binderId);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Reset error when closing dialog
      setNewBinderName('');
    }
    setIsDialogOpen(open);
  };

  const handleRetry = () => {
    refetchBinders();
    refetchSubscription();
  };

  const isLoading = bindersLoading || isLoadingSubscription;
  const hasError = bindersError || subscriptionError;

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full px-4">
          <Alert variant="destructive" className="rounded-2xl border-2 mb-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              <strong className="block mb-2">Unable to load your binders</strong>
              <p className="text-sm mb-4">
                {(bindersError as Error)?.message || (subscriptionError as Error)?.message || 'An unexpected error occurred. Please try again.'}
              </p>
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={handleRetry}
            className="w-full bg-binder-accent hover:bg-binder-accent-hover text-white rounded-xl h-12"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-binder-accent" />
      </div>
    );
  }

  // Normalize error message if present
  const normalizedError = createError
    ? normalizeBackendError(createError, planName, maxBinders, isFree)
    : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-charcoal mb-2 font-handwriting">
            My Binders
          </h2>
          <p className="text-muted-foreground">
            {binders.length === 0 ? 'Create your first binder to get started' : `${binders.length} of ${maxBinders} ${binders.length === 1 ? 'binder' : 'binders'} (${planName} plan)`}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button 
              className="bg-binder-accent hover:bg-binder-accent-hover text-white rounded-2xl shadow-md h-12 px-6"
              disabled={isAtLimit}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Binder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-handwriting">Create New Binder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {isAtLimit && (
                <Alert className="border-amber-200 bg-amber-50 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    You've reached the limit of {maxBinders} binders for the {planName} plan.{' '}
                    {isFree && hasUpgradeUrl ? (
                      <>
                        <a
                          href={shopifyUpgradeUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline hover:text-amber-900 inline-flex items-center gap-1"
                        >
                          Upgrade to Subscriber
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {' '}to get up to 5 binders, or delete a binder to create a new one.
                      </>
                    ) : isFree && !hasUpgradeUrl ? (
                      'Upgrade to Subscriber to get up to 5 binders, or delete a binder to create a new one.'
                    ) : (
                      'Delete a binder to create a new one.'
                    )}
                  </AlertDescription>
                </Alert>
              )}
              {normalizedError && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {normalizedError.userMessage}
                    {isFree && hasUpgradeUrl && (
                      <>
                        {' '}
                        <a
                          href={shopifyUpgradeUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline hover:text-red-800 inline-flex items-center gap-1"
                        >
                          Upgrade now
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="binder-name">Binder Name</Label>
                <Input
                  id="binder-name"
                  value={newBinderName}
                  onChange={(e) => setNewBinderName(e.target.value)}
                  placeholder="e.g., My K-pop Collection"
                  className="rounded-xl border-2 border-sage/30 focus:border-binder-accent"
                  disabled={isAtLimit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isAtLimit) {
                      handleCreateBinder();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateBinder}
                disabled={!newBinderName.trim() || isCreating || isAtLimit}
                className="bg-binder-accent hover:bg-binder-accent-hover text-white rounded-xl"
              >
                {isCreating ? 'Creating...' : 'Create Binder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isAtLimit && (
        <Alert className="mb-6 border-amber-200 bg-amber-50 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Binder limit reached:</strong> You have {binders.length} of {maxBinders} binders allowed on the {planName} plan.{' '}
            {isFree && hasUpgradeUrl ? (
              <>
                <a
                  href={shopifyUpgradeUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:text-amber-900 inline-flex items-center gap-1"
                >
                  Upgrade to Subscriber
                  <ExternalLink className="w-3 h-3" />
                </a>
                {' '}to get up to 5 binders.
              </>
            ) : isFree && !hasUpgradeUrl ? (
              'Upgrade to Subscriber to get up to 5 binders.'
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      {binders.length === 0 ? (
        <Card className="border-4 border-dashed border-sage/30 rounded-3xl bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="w-16 h-16 text-sage/40 mb-4" />
            <p className="text-lg text-muted-foreground mb-4">No binders yet</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Create your first binder to start collecting and organizing your photocards
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {binders.map((binder) => (
            <Card
              key={binder.id}
              className="group hover:shadow-xl transition-all duration-300 rounded-3xl border-4 border-sage/20 bg-white/80 backdrop-blur-sm overflow-hidden cursor-pointer"
              style={{
                borderColor: binder.theme.accentColor || undefined,
              }}
            >
              <div
                className="h-48 bg-gradient-to-br from-sage/20 to-sage/5 flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundColor: binder.theme.coverColor || undefined,
                }}
                onClick={() => onOpenBinder(binder.id)}
              >
                <BookOpen className="w-20 h-20 text-sage/30 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle
                    className="text-xl font-handwriting text-charcoal group-hover:text-binder-accent transition-colors cursor-pointer flex-1"
                    onClick={() => onOpenBinder(binder.id)}
                  >
                    {binder.name}
                  </CardTitle>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-handwriting text-2xl">Delete Binder?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{binder.name}"? This will permanently remove the binder and all its cards. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteBinder(binder.id)}
                          className="bg-destructive hover:bg-destructive/90 text-white rounded-xl"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {binder.cards.length} {binder.cards.length === 1 ? 'card' : 'cards'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
