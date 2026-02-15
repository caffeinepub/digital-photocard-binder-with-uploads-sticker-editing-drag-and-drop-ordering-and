import { useState, useEffect } from 'react';
import { useGetBinders, useReorderCards } from '../hooks/useQueries';
import { useBinderPagination } from '../hooks/useBinderPagination';
import { getEditedImage } from '../features/cards/editedImageCache';
import {
  getConditionStickerPath,
  getRarityBadgePath,
  getGlintOverlayPath,
  shouldShowGlint,
} from '../features/cards/overlayAssets';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Settings, GripVertical, Pencil, ChevronLeft, ChevronRight, BookHeart, FileDown } from 'lucide-react';
import BinderFrame from '../components/binder/BinderFrame';
import BinderRingsOverlay from '../components/binder/BinderRingsOverlay';
import PageSwipeContainer from '../components/binder/PageSwipeContainer';
import BinderPdfExportDialog from '../components/binder/BinderPdfExportDialog';
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
  const [showExportDialog, setShowExportDialog] = useState(false);

  const {
    currentPage,
    totalPages,
    currentCards,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = useBinderPagination(cards);

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

    const pageOffset = currentPage * 12;
    const globalDraggedIndex = pageOffset + draggedIndex;
    const globalDropIndex = pageOffset + dropIndex;

    const newCards = [...cards];
    const [draggedCard] = newCards.splice(globalDraggedIndex, 1);
    newCards.splice(globalDropIndex, 0, draggedCard);

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
        <p className="text-binder-text-muted">Binder not found</p>
        <Button onClick={onBack} className="mt-4 rounded-xl bg-binder-accent hover:bg-binder-accent-hover">
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
            className="rounded-lg border border-binder-border hover:border-binder-accent bg-transparent text-binder-text"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-4xl font-bold text-binder-text font-display">
              {binder.name}
            </h2>
            <p className="text-sm text-binder-text-muted mt-1">
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {cards.length > 0 && (
            <Button
              onClick={() => setShowExportDialog(true)}
              variant="outline"
              className="rounded-lg border border-binder-border hover:border-binder-accent bg-transparent text-binder-text"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Export PDF
            </Button>
          )}
          <Button
            onClick={onSettings}
            variant="outline"
            className="rounded-lg border border-binder-border hover:border-binder-accent bg-transparent text-binder-text"
          >
            <Settings className="w-5 h-5 mr-2" />
            Customize
          </Button>
          <Button
            onClick={onAddCard}
            className="rounded-lg bg-binder-accent hover:bg-binder-accent-hover text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      <div className="relative">
        <BinderRingsOverlay />
        <BinderFrame theme={binder.theme}>
          <PageSwipeContainer
            currentPage={currentPage}
            onSwipeLeft={hasNext ? nextPage : undefined}
            onSwipeRight={hasPrev ? prevPage : undefined}
          >
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-binder-accent/10 rounded-full flex items-center justify-center mb-6">
                  <BookHeart className="w-12 h-12 text-binder-accent" />
                </div>
                <h3 className="text-2xl font-bold text-binder-text mb-2 font-display">
                  Your binder is empty
                </h3>
                <p className="text-binder-text-muted mb-6 max-w-md">
                  Start building your collection by adding your first photocard
                </p>
                <Button
                  onClick={onAddCard}
                  className="rounded-lg bg-binder-accent hover:bg-binder-accent-hover text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Card
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {currentCards.map((card, index) => {
                    const editedImage = getEditedImage(card.id);
                    const imageUrl = editedImage || card.image.getDirectURL();
                    const isDragging = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;

                    const conditionStickerPath = getConditionStickerPath(card.condition);
                    const rarityBadgePath = getRarityBadgePath(card.rarity);
                    const showGlint = shouldShowGlint(card.rarity);

                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`group relative aspect-[2/3] bg-binder-card rounded-xl overflow-hidden border-2 transition-all cursor-move ${
                          isDragging
                            ? 'opacity-50 scale-95 border-binder-accent'
                            : isDragOver
                            ? 'border-binder-accent scale-105 shadow-binder-lg'
                            : 'border-binder-border hover:border-binder-accent shadow-binder'
                        }`}
                      >
                        {/* Card image container with overlays */}
                        <div className="relative w-full h-full">
                          <img
                            src={imageUrl}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />

                          {/* Holographic glint overlay for legendary cards */}
                          {showGlint && (
                            <img
                              src={getGlintOverlayPath()}
                              alt="Holographic glint"
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                              style={{ opacity: 0.5 }}
                            />
                          )}

                          {/* Condition sticker - top right, -5 degree rotation */}
                          {conditionStickerPath && (
                            <img
                              src={conditionStickerPath}
                              alt="Condition"
                              className="absolute top-1 right-1 w-12 h-12 object-contain pointer-events-none"
                              style={{ transform: 'rotate(-5deg)' }}
                            />
                          )}

                          {/* Rarity badge - bottom left */}
                          {rarityBadgePath && (
                            <img
                              src={rarityBadgePath}
                              alt="Rarity"
                              className="absolute bottom-1 left-1 w-8 h-8 object-contain pointer-events-none"
                            />
                          )}
                        </div>

                        {/* Hover gradient and controls */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute top-2 left-2">
                            <GripVertical className="w-5 h-5 text-white drop-shadow-lg" />
                          </div>
                          <button
                            onClick={() => onEditCard(card.id)}
                            className="absolute bottom-2 right-2 p-2 bg-binder-accent hover:bg-binder-accent-hover text-white rounded-lg shadow-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quantity badge */}
                        {card.quantity > 1 && (
                          <div className="absolute top-2 right-2 bg-binder-accent text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            ×{card.quantity}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-binder-border">
                    <Button
                      onClick={prevPage}
                      disabled={!hasPrev}
                      variant="outline"
                      size="sm"
                      className="rounded-lg border border-binder-border hover:border-binder-accent bg-transparent text-binder-text disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-binder-text-muted font-medium">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      onClick={nextPage}
                      disabled={!hasNext}
                      variant="outline"
                      size="sm"
                      className="rounded-lg border border-binder-border hover:border-binder-accent bg-transparent text-binder-text disabled:opacity-30"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </PageSwipeContainer>
        </BinderFrame>
      </div>

      {/* PDF Export Dialog */}
      <BinderPdfExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        binderName={binder.name}
        pageNumber={currentPage + 1}
        cards={currentCards}
        pageBackground={binder.theme.pageBackground}
      />
    </div>
  );
}
