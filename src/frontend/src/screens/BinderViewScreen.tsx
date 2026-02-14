import { useState, useEffect } from 'react';
import { useGetBinders, useReorderCards } from '../hooks/useQueries';
import { getEditedImage, clearEditedImage } from '../features/cards/editedImageCache';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Settings, GripVertical, Pencil } from 'lucide-react';
import type { Photocard } from '../backend';

interface BinderViewScreenProps {
  binderId: string;
  onBack: () => void;
  onAddCard: () => void;
  onEditCard: (cardId: string) => void;
  onSettings: () => void;
}

export default function BinderViewScreen({
  binderId,
  onBack,
  onAddCard,
  onEditCard,
  onSettings,
}: BinderViewScreenProps) {
  const { data: binders = [] } = useGetBinders();
  const { mutate: reorderCards } = useReorderCards();
  const binder = binders.find((b) => b.id === binderId);

  const [cards, setCards] = useState<Photocard[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (binder) {
      setCards(binder.cards);
    }
  }, [binder]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newCards = [...cards];
    const [draggedCard] = newCards.splice(draggedIndex, 1);
    newCards.splice(dropIndex, 0, draggedCard);

    setCards(newCards);
    setDraggedIndex(null);
    setDragOverIndex(null);

    reorderCards({
      binderId,
      newOrder: newCards.map((c) => c.id),
    });
  };

  if (!binder) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Binder not found</p>
        <Button onClick={onBack} className="mt-4 rounded-xl">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
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
              {binder.name}
            </h2>
            <p className="text-muted-foreground">
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onSettings}
            variant="outline"
            className="rounded-2xl border-2 border-sage/30 hover:border-coral hover:bg-coral/5"
          >
            <Settings className="w-5 h-5 mr-2" />
            Customize
          </Button>
          <Button
            onClick={onAddCard}
            className="bg-coral hover:bg-coral-dark text-white rounded-2xl shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      <div
        className="rounded-3xl p-8 min-h-[500px] border-4"
        style={{
          backgroundColor: binder.theme.pageBackground,
          borderColor: binder.theme.accentColor,
          backgroundImage: binder.theme.backgroundPattern ? `url(${binder.theme.backgroundPattern})` : undefined,
          backgroundSize: 'cover',
        }}
      >
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-muted-foreground mb-4">No cards yet</p>
            <Button
              onClick={onAddCard}
              className="bg-coral hover:bg-coral-dark text-white rounded-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Card
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {cards.map((card, index) => (
              <PhotocardTile
                key={card.id}
                card={card}
                index={index}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onEdit={() => onEditCard(card.id)}
                frameStyle={binder.theme.cardFrameStyle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PhotocardTileProps {
  card: Photocard;
  index: number;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onEdit: () => void;
  frameStyle: string;
}

function PhotocardTile({
  card,
  index,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onEdit,
  frameStyle,
}: PhotocardTileProps) {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const editedImage = getEditedImage(card.id);
    if (editedImage) {
      setImageUrl(editedImage);
    } else {
      setImageUrl(card.image.getDirectURL());
    }
  }, [card.id, card.image]);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-200 cursor-move ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isDragOver ? 'ring-4 ring-coral' : ''} hover:shadow-2xl hover:scale-105`}
      style={{
        borderWidth: frameStyle === 'thick' ? '4px' : '2px',
        borderStyle: frameStyle === 'dashed' ? 'dashed' : 'solid',
        borderColor: frameStyle === 'none' ? 'transparent' : '#e5c5b5',
      }}
    >
      <div className="aspect-[2/3] relative">
        <img
          src={imageUrl}
          alt={card.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-1.5 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-charcoal" />
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-2 right-2 bg-coral hover:bg-coral-dark text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-sm font-medium truncate drop-shadow-lg">
            {card.name}
          </p>
        </div>
      </div>
    </div>
  );
}
