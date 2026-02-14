import { useState, useEffect, useRef } from 'react';
import { useGetBinders } from '../hooks/useQueries';
import { saveEditedImage } from '../features/cards/editedImageCache';
import { STICKERS, type StickerType } from '../features/editor/stickerTray';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, X, RotateCw, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EditCardScreenProps {
  binderId: string;
  cardId: string;
  onBack: () => void;
  onSave: () => void;
}

interface Sticker {
  id: string;
  type: StickerType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function EditCardScreen({ binderId, cardId, onBack, onSave }: EditCardScreenProps) {
  const { data: binders = [] } = useGetBinders();
  const binder = binders.find((b) => b.id === binderId);
  const card = binder?.cards.find((c) => c.id === cardId);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!card) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setBaseImage(img);
    img.src = card.image.getDirectURL();
  }, [card]);

  useEffect(() => {
    if (!canvasRef.current || !baseImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = baseImage.width;
    canvas.height = baseImage.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0);

    stickers.forEach((sticker) => {
      const stickerData = STICKERS.find((s) => s.type === sticker.type);
      if (!stickerData || !stickerData.image) return;

      ctx.save();
      ctx.translate(sticker.x, sticker.y);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.scale(sticker.scale, sticker.scale);
      ctx.drawImage(
        stickerData.image,
        -stickerData.width / 2,
        -stickerData.height / 2,
        stickerData.width,
        stickerData.height
      );
      ctx.restore();

      if (sticker.id === selectedStickerId) {
        const accentColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--binder-accent')
          .trim();
        ctx.strokeStyle = accentColor ? `oklch(${accentColor})` : '#E07A5F';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        const size = Math.max(stickerData.width, stickerData.height) * sticker.scale;
        ctx.strokeRect(
          sticker.x - size / 2,
          sticker.y - size / 2,
          size,
          size
        );
        ctx.setLineDash([]);
      }
    });
  }, [baseImage, stickers, selectedStickerId]);

  const addSticker = (type: StickerType) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const newSticker: Sticker = {
      id: Date.now().toString(),
      type,
      x: canvas.width / 2,
      y: canvas.height / 2,
      scale: 1,
      rotation: 0,
    };

    setStickers([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (let i = stickers.length - 1; i >= 0; i--) {
      const sticker = stickers[i];
      const stickerData = STICKERS.find((s) => s.type === sticker.type);
      if (!stickerData) continue;

      const size = Math.max(stickerData.width, stickerData.height) * sticker.scale;
      const halfSize = size / 2;

      if (
        x >= sticker.x - halfSize &&
        x <= sticker.x + halfSize &&
        y >= sticker.y - halfSize &&
        y <= sticker.y + halfSize
      ) {
        setSelectedStickerId(sticker.id);
        setIsDragging(true);
        setDragStart({ x: x - sticker.x, y: y - sticker.y });
        return;
      }
    }

    setSelectedStickerId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedStickerId || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setStickers(
      stickers.map((s) =>
        s.id === selectedStickerId
          ? { ...s, x: x - dragStart.x, y: y - dragStart.y }
          : s
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const rotateSelectedSticker = () => {
    if (!selectedStickerId) return;
    setStickers(
      stickers.map((s) =>
        s.id === selectedStickerId ? { ...s, rotation: (s.rotation + 45) % 360 } : s
      )
    );
  };

  const deleteSelectedSticker = () => {
    if (!selectedStickerId) return;
    setStickers(stickers.filter((s) => s.id !== selectedStickerId));
    setSelectedStickerId(null);
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        // Convert Blob to data URL for localStorage
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          saveEditedImage(cardId, dataUrl);
          onSave();
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/png');
  };

  if (!card) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Card not found</p>
        <Button onClick={onBack} className="mt-4 bg-binder-accent hover:bg-binder-accent-hover text-white rounded-xl">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="rounded-full border-2 border-sage/30 hover:border-binder-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-4xl font-bold text-charcoal font-handwriting">
            Edit Card
          </h2>
        </div>
        <Button
          onClick={handleSave}
          className="bg-binder-accent hover:bg-binder-accent-hover text-white rounded-xl h-12 px-6"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="rounded-3xl border-4 border-sage/20 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="relative bg-binder-dark rounded-2xl p-4 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className="max-w-full max-h-[600px] cursor-move rounded-xl shadow-binder-lg"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-4 border-sage/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-charcoal mb-4 font-handwriting">
                Stickers
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {STICKERS.map((sticker) => (
                  <button
                    key={sticker.type}
                    onClick={() => addSticker(sticker.type)}
                    className="aspect-square border-2 border-sage/30 rounded-xl hover:border-binder-accent hover:bg-binder-accent/5 transition-all p-2 bg-white"
                  >
                    {sticker.image && (
                      <img
                        src={sticker.image.src}
                        alt={sticker.type}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedStickerId && (
            <Card className="rounded-3xl border-4 border-binder-accent/30 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-4 font-handwriting">
                  Edit Sticker
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={rotateSelectedSticker}
                    variant="outline"
                    className="w-full rounded-xl border-2 border-sage/30 hover:border-binder-accent"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate
                  </Button>
                  <Button
                    onClick={deleteSelectedSticker}
                    variant="outline"
                    className="w-full rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    onClick={() => setSelectedStickerId(null)}
                    variant="ghost"
                    className="w-full rounded-xl"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Deselect
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
