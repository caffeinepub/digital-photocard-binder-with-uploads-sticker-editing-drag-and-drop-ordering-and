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
        ctx.strokeStyle = '#E07A5F';
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

  const scaleSelectedSticker = (delta: number) => {
    if (!selectedStickerId) return;
    setStickers(
      stickers.map((s) =>
        s.id === selectedStickerId
          ? { ...s, scale: Math.max(0.5, Math.min(3, s.scale + delta)) }
          : s
      )
    );
  };

  const deleteSelectedSticker = () => {
    if (!selectedStickerId) return;
    setStickers(stickers.filter((s) => s.id !== selectedStickerId));
    setSelectedStickerId(null);
  };

  const handleSave = () => {
    if (!canvasRef.current || !card) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      saveEditedImage(card.id, url);
      onSave();
    }, 'image/png');
  };

  if (!card || !binder) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Card not found</p>
        <Button onClick={onBack} className="mt-4 rounded-xl">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={onBack}
          variant="outline"
          size="icon"
          className="rounded-full border-2 border-sage/30 hover:border-coral"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-4xl font-bold text-charcoal font-handwriting">
            Edit Card
          </h2>
          <p className="text-muted-foreground">{card.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="rounded-3xl border-4 border-sage/20 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className="max-w-full h-auto border-2 border-sage/20 rounded-xl cursor-crosshair shadow-lg"
                  style={{ maxHeight: '70vh' }}
                />
              </div>

              {selectedStickerId && (
                <div className="flex justify-center gap-3 mt-6">
                  <Button
                    onClick={rotateSelectedSticker}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate
                  </Button>
                  <Button
                    onClick={() => scaleSelectedSticker(0.2)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    Bigger
                  </Button>
                  <Button
                    onClick={() => scaleSelectedSticker(-0.2)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    Smaller
                  </Button>
                  <Button
                    onClick={deleteSelectedSticker}
                    variant="destructive"
                    size="sm"
                    className="rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-4 border-sage/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 font-handwriting">Stickers</h3>
              <div className="grid grid-cols-3 gap-3">
                {STICKERS.map((sticker) => (
                  <button
                    key={sticker.type}
                    onClick={() => addSticker(sticker.type)}
                    className="aspect-square bg-cream hover:bg-peach rounded-xl border-2 border-sage/30 hover:border-coral transition-all p-2 flex items-center justify-center"
                    title={sticker.label}
                  >
                    {sticker.image && (
                      <img
                        src={sticker.image.src}
                        alt={sticker.label}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSave}
              className="w-full bg-coral hover:bg-coral-dark text-white rounded-2xl h-12"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full rounded-2xl h-12 border-2 border-sage/30"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
