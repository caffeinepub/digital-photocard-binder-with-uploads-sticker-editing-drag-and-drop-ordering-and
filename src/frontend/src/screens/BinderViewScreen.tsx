import { useState, useEffect } from 'react';
import { useGetBinders, useReorderCards, useGetUserLayout, useGetDefaultLayout } from '../hooks/useQueries';
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
  const { data: userLayout, isLoading: userLayoutLoading } = useGetUserLayout();
  const { data: defaultLayout, isLoading: defaultLayoutLoading } = useGetDefaultLayout();
  const { mutate: reorderCards } = useReorderCards();
  const binder = binders.find((b) => b.id === binderId);

  const [cards, setCards] = useState<Photocard[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Parse grid layout (e.g., "3x3" -> { cols: 3, rows: 3 })
  // Use userLayout if available, otherwise fall back to defaultLayout
  const layout = userLayout || defaultLayout || '3x3';
  const [colsStr, rowsStr] = layout.split('x');
  const cols = parseInt(colsStr, 10) || 3;
  const rows = parseInt(rowsStr, 10) || 3;
  const cardsPerPage = cols * rows;

  const {
    currentPage,
    totalPages,
    currentCards,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = useBinderPagination(cards, cardsPerPage);

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

    const pageOffset = currentPage * cardsPerPage;
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

  // Show loading state while layout is being fetched
  const isLayoutLoading = userLayoutLoading || defaultLayoutLoading;

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
              {cards.length} {cards.length === 1 ? 'card' : 'cards'} • {layout} grid
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
                  className="rounded-xl bg-binder-accent hover:bg-binder-accent-hover text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Card
                </Button>
              </div>
            ) : isLayoutLoading ? (
              <div className="flex items-center justify-center py-24">
                <p className="text-binder-text-muted">Loading layout...</p>
              </div>
            ) : (
              <div
                className="grid gap-4 p-8"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                }}
              >
                {Array.from({ length: cardsPerPage }).map((_, index) => {
                  const card = currentCards[index];
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;

                  if (!card) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="aspect-[2.5/3.5] bg-binder-page/30 rounded-lg border-2 border-dashed border-binder-border/30"
                      />
                    );
                  }

                  const editedImageUrl = getEditedImage(card.id);
                  const imageUrl = editedImageUrl || card.image.getDirectURL();
                  const conditionPath = getConditionStickerPath(card.condition);
                  const rarityPath = getRarityBadgePath(card.rarity);

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`relative aspect-[2.5/3.5] bg-white rounded-lg shadow-card overflow-hidden cursor-move group transition-all ${
                        isDragging ? 'opacity-50 scale-95' : ''
                      } ${isDragOver ? 'ring-2 ring-binder-accent' : ''}`}
                    >
                      <img
                        src={imageUrl}
                        alt={card.name}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />

                      {conditionPath && (
                        <img
                          src={conditionPath}
                          alt={`${card.condition} condition`}
                          className="absolute top-2 left-2 w-12 h-12 pointer-events-none"
                          draggable={false}
                        />
                      )}

                      {rarityPath && (
                        <img
                          src={rarityPath}
                          alt={`${card.rarity} rarity`}
                          className="absolute top-2 right-2 w-8 h-8 pointer-events-none"
                          draggable={false}
                        />
                      )}

                      {shouldShowGlint(card.rarity) && (
                        <img
                          src={getGlintOverlayPath()}
                          alt="Legendary glint"
                          className="absolute inset-0 w-full h-full pointer-events-none opacity-60 mix-blend-screen"
                          draggable={false}
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white">
                            <GripVertical className="w-4 h-4" />
                            <span className="text-sm font-medium truncate">{card.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCard(card.id);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PageSwipeContainer>
        </BinderFrame>

        {cards.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              onClick={prevPage}
              disabled={!hasPrev}
              variant="outline"
              size="icon"
              className="rounded-lg border border-binder-border hover:border-binder-accent bg-transparent text-binder-text disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm text-binder-text-muted font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              onClick={nextPage}
              disabled={!hasNext}
              variant="outline"
              size="icon"
              className="rounded-lg border border-binder-border hover:border-binder-accent bg-transparent text-binder-text disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {showExportDialog && (
        <BinderPdfExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          binderName={binder.name}
          pageNumber={currentPage + 1}
          cards={currentCards}
          pageBackground={binder.theme.pageBackground}
        />
      )}
    </div>
  );
}
