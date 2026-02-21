import React, { useMemo } from 'react';
import { useGetBinders, useGetUserLayout } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle, Plus, Settings } from 'lucide-react';
import BinderFrame from '../components/binder/BinderFrame';
import { useBinderPagination } from '../hooks/useBinderPagination';
import PageSwipeContainer from '../components/binder/PageSwipeContainer';

interface BinderViewScreenProps {
  binderId: string;
  onBack: () => void;
  onAddCard: () => void;
  onEditCard: (cardId: string) => void;
  onSettings: () => void;
}

export default function BinderViewScreen({ binderId, onBack, onAddCard, onEditCard, onSettings }: BinderViewScreenProps) {
  const { data: binders, isLoading: bindersLoading, error: bindersError, refetch: refetchBinders } = useGetBinders();
  const { data: userLayout, isLoading: layoutLoading, error: layoutError } = useGetUserLayout();

  const isLoading = bindersLoading || layoutLoading;
  const error = bindersError || layoutError;

  const binder = useMemo(() => {
    if (!binders) return null;
    return binders.find((b) => b.id === binderId) || null;
  }, [binders, binderId]);

  const { cols, rows } = useMemo(() => {
    if (!userLayout) return { cols: 3, rows: 3 };
    const [colsStr, rowsStr] = userLayout.split('x');
    return {
      cols: parseInt(colsStr, 10) || 3,
      rows: parseInt(rowsStr, 10) || 3,
    };
  }, [userLayout]);

  const cardsPerPage = cols * rows;

  const { currentPage, totalPages, currentCards, nextPage, prevPage, hasNext, hasPrev } =
    useBinderPagination(binder?.cards || [], cardsPerPage);

  console.log('[BinderViewScreen] Render state:', {
    binderId,
    binderFound: !!binder,
    cardsCount: binder?.cards.length || 0,
    currentPage,
    totalPages,
    currentCardsCount: currentCards.length,
    userLayout,
    cols,
    rows,
    cardsPerPage,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading binder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="text-lg font-semibold">Failed to Load Binder</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
            <Button onClick={() => refetchBinders()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!binder) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">Binder Not Found</h3>
          <p className="text-sm text-muted-foreground">The requested binder could not be found.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>
        <h1 className="text-2xl font-bold">{binder.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onSettings} className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button onClick={onAddCard} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Card
          </Button>
        </div>
      </div>

      <PageSwipeContainer
        currentPage={currentPage}
        onSwipeLeft={hasNext ? nextPage : undefined}
        onSwipeRight={hasPrev ? prevPage : undefined}
      >
        <BinderFrame theme={binder.theme}>
          <div
            className="grid gap-4 p-6 w-full h-full"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {currentCards.map((card) => (
              <div
                key={card.id}
                className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-border bg-card hover:border-primary transition-colors"
                onClick={() => onEditCard(card.id)}
              >
                <img
                  src={card.image.getDirectURL()}
                  alt={card.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Edit Card</span>
                </div>
              </div>
            ))}
            {Array.from({ length: cardsPerPage - currentCards.length }).map((_, i) => (
              <div key={`empty-${i}`} className="border-2 border-dashed border-muted rounded-lg" />
            ))}
          </div>
        </BinderFrame>
      </PageSwipeContainer>

      <div className="flex items-center justify-center gap-4">
        <Button onClick={prevPage} disabled={!hasPrev} variant="outline">
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button onClick={nextPage} disabled={!hasNext} variant="outline">
          Next
        </Button>
      </div>
    </div>
  );
}
