import { useState } from 'react';
import { useAddPhotocard } from '../hooks/useQueries';
import { validateImageFile } from '../features/cards/imageValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AddCardScreenProps {
  binderId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function AddCardScreen({ binderId, onBack, onSuccess }: AddCardScreenProps) {
  const [cardName, setCardName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: addPhotocard, isPending } = useAddPhotocard();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !cardName.trim()) return;

    const arrayBuffer = await selectedFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    addPhotocard(
      {
        binderId,
        name: cardName.trim(),
        imageBytes: bytes,
        position: { page: 0n, slot: 0n },
        quantity: 1n,
        onProgress: (percentage) => setUploadProgress(percentage),
      },
      {
        onSuccess: () => {
          onSuccess();
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to add card');
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={onBack}
          variant="outline"
          size="icon"
          className="rounded-full border-2 border-sage/30 hover:border-binder-accent"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-4xl font-bold text-charcoal font-handwriting">
          Add New Card
        </h2>
      </div>

      <Card className="rounded-3xl border-4 border-sage/20 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-handwriting">Upload Photocard</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="card-name">Card Name</Label>
              <Input
                id="card-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="e.g., Jungkook - Butter"
                className="rounded-xl border-2 border-sage/30 focus:border-binder-accent"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-image">Image</Label>
              <div className="border-4 border-dashed border-sage/30 rounded-2xl p-8 text-center hover:border-binder-accent transition-colors">
                <input
                  id="card-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="card-image"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 rounded-xl shadow-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-sage" />
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          Click to upload image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG or JPEG, max 10MB
                        </p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {isPending && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="text-binder-accent font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1 rounded-xl border-2 border-sage/30"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || !cardName.trim() || isPending}
                className="flex-1 bg-binder-accent hover:bg-binder-accent-hover text-white rounded-xl"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Card'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
