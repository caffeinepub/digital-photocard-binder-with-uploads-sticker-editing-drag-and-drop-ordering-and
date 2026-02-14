import { useState } from 'react';
import { useGetBinders, useCreateBinder, useDeleteBinder } from '../hooks/useQueries';
import { getDefaultTheme } from '../features/binders/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BinderLibraryScreenProps {
  onOpenBinder: (binderId: string) => void;
}

export default function BinderLibraryScreen({ onOpenBinder }: BinderLibraryScreenProps) {
  const { data: binders = [], isLoading } = useGetBinders();
  const { mutate: createBinder, isPending: isCreating } = useCreateBinder();
  const { mutate: deleteBinder, isPending: isDeleting } = useDeleteBinder();
  const [newBinderName, setNewBinderName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateBinder = () => {
    if (newBinderName.trim()) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-charcoal mb-2 font-handwriting">
            My Binders
          </h2>
          <p className="text-muted-foreground">
            {binders.length === 0 ? 'Create your first binder to get started' : `${binders.length} ${binders.length === 1 ? 'binder' : 'binders'}`}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-coral hover:bg-coral-dark text-white rounded-2xl shadow-md h-12 px-6">
              <Plus className="w-5 h-5 mr-2" />
              New Binder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-handwriting">Create New Binder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="binder-name">Binder Name</Label>
                <Input
                  id="binder-name"
                  value={newBinderName}
                  onChange={(e) => setNewBinderName(e.target.value)}
                  placeholder="e.g., My K-pop Collection"
                  className="rounded-xl border-2 border-sage/30 focus:border-coral"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateBinder();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateBinder}
                disabled={!newBinderName.trim() || isCreating}
                className="bg-coral hover:bg-coral-dark text-white rounded-xl"
              >
                {isCreating ? 'Creating...' : 'Create Binder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                className="h-32 relative"
                style={{
                  backgroundColor: binder.theme.coverColor,
                  backgroundImage: binder.theme.coverTexture ? `url(${binder.theme.coverTexture})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                onClick={() => onOpenBinder(binder.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              </div>
              <CardHeader onClick={() => onOpenBinder(binder.id)}>
                <CardTitle className="text-xl font-handwriting text-charcoal line-clamp-2">
                  {binder.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {binder.cards.length} {binder.cards.length === 1 ? 'card' : 'cards'}
                </p>
              </CardHeader>
              <CardContent className="flex justify-between items-center pt-0">
                <Button
                  onClick={() => onOpenBinder(binder.id)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-2 border-sage/30 hover:border-coral hover:bg-coral/5"
                >
                  Open
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Binder?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{binder.name}" and all its cards. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteBinder(binder.id)}
                        className="bg-destructive hover:bg-destructive/90 rounded-xl"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
