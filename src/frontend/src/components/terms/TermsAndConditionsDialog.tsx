import { useGetAdminContentSettings } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface TermsAndConditionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TermsAndConditionsDialog({ open, onOpenChange }: TermsAndConditionsDialogProps) {
  const { data: settings, isLoading } = useGetAdminContentSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
          <DialogDescription>
            Please review our terms and conditions
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-binder-accent" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm text-binder-text">
              {settings?.termsAndConditions || 'No terms and conditions available.'}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
