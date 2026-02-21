import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, BookOpen, Image as ImageIcon } from 'lucide-react';
import { useGetBindersByUser } from '../../hooks/useQueries';
import type { UserAnalytics, BinderView } from '../../backend';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminUserBinderReadOnlyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserAnalytics;
}

export default function AdminUserBinderReadOnlyDialog({
  open,
  onOpenChange,
  user,
}: AdminUserBinderReadOnlyDialogProps) {
  const getBindersMutation = useGetBindersByUser();
  const [binders, setBinders] = useState<BinderView[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadBinders();
    }
  }, [open]);

  const loadBinders = async () => {
    setError(null);
    try {
      const userBinders = await getBindersMutation.mutateAsync(user.principal);
      setBinders(userBinders);
    } catch (err: any) {
      setError(err.message || 'Failed to load user binders');
      console.error('Load binders error:', err);
    }
  };

  const handleRetry = () => {
    loadBinders();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {user.email || 'User'}'s Binder Collection (Read-Only)
          </DialogTitle>
          <DialogDescription>
            Viewing binders for {user.email || user.principal.toString().slice(0, 20) + '...'}
          </DialogDescription>
        </DialogHeader>

        {getBindersMutation.isPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-binder-accent" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="link" onClick={handleRetry} className="p-0 h-auto">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!getBindersMutation.isPending && !error && (
          <ScrollArea className="max-h-[60vh]">
            {binders.length === 0 ? (
              <div className="text-center py-8 text-binder-text-muted">
                This user has no binders yet.
              </div>
            ) : (
              <div className="space-y-4">
                {binders.map((binder) => (
                  <Card key={binder.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{binder.name}</CardTitle>
                      <p className="text-sm text-binder-text-muted">
                        {binder.cards.length} card{binder.cards.length !== 1 ? 's' : ''}
                      </p>
                    </CardHeader>
                    <CardContent>
                      {binder.cards.length === 0 ? (
                        <div className="text-center py-4 text-binder-text-muted">
                          No cards in this binder
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-4">
                          {binder.cards.map((card) => (
                            <div
                              key={card.id}
                              className="relative aspect-[2.5/3.5] rounded-lg overflow-hidden border border-binder-border bg-binder-page shadow-sm"
                            >
                              <img
                                src={card.image.getDirectURL()}
                                alt={card.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                <p className="text-white text-xs font-medium truncate">
                                  {card.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
