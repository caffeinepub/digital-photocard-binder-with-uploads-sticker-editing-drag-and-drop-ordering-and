import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, FileDown, Printer } from 'lucide-react';
import type { Photocard } from '../../backend';
import { generateBinderPagePdf, type PageSize, type QualityMode } from '../../features/export/binderPagePdf';
import { generateFilename } from '../../features/export/shareOrDownloadPdf';

interface BinderPdfExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binderName: string;
  pageNumber: number;
  cards: Photocard[];
  pageBackground: string;
}

export default function BinderPdfExportDialog({
  open,
  onOpenChange,
  binderName,
  pageNumber,
  cards,
  pageBackground,
}: BinderPdfExportDialogProps) {
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [quality, setQuality] = useState<QualityMode>('high');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await generateBinderPagePdf({
        binderName,
        pageNumber,
        cards,
        pageBackground,
        pageSize,
        quality,
      });
      
      // Close dialog after a short delay to allow print window to open
      setTimeout(() => {
        onOpenChange(false);
        setIsGenerating(false);
      }, 500);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError(
        err instanceof Error && err.message.includes('popup')
          ? 'Please allow popups for this site to export PDFs.'
          : 'Failed to generate PDF. Please try again.'
      );
      setIsGenerating(false);
    }
  };

  const suggestedFilename = generateFilename(binderName, pageNumber);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Page as PDF</DialogTitle>
          <DialogDescription>
            Export page {pageNumber} of {binderName} as a GoodNotes-ready PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Page Size Selection */}
          <div className="space-y-2">
            <Label htmlFor="page-size">Page Size</Label>
            <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
              <SelectTrigger id="page-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4 Portrait (210 × 297 mm)</SelectItem>
                <SelectItem value="letter">US Letter Portrait (8.5 × 11 in)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Selection */}
          <div className="space-y-2">
            <Label htmlFor="quality">Quality</Label>
            <Select value={quality} onValueChange={(v) => setQuality(v as QualityMode)}>
              <SelectTrigger id="quality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High (recommended for GoodNotes)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              High quality ensures crisp text and images when zooming in GoodNotes
            </p>
          </div>

          {/* Filename suggestion */}
          <div className="space-y-2">
            <Label>Suggested filename</Label>
            <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded-md">
              {suggestedFilename}
            </p>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
            <p className="text-blue-900 dark:text-blue-100">
              <strong>How to save:</strong> In the print dialog, select "Save as PDF" as your printer/destination, 
              then use the suggested filename above.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-binder-accent hover:bg-binder-accent-hover"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Open Print Dialog
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
