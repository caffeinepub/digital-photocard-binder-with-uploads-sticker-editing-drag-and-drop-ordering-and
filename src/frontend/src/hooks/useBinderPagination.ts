import { useState, useMemo } from 'react';
import type { Photocard } from '../backend';

export function useBinderPagination(cards: Photocard[], cardsPerPage: number = 12) {
  const [currentPage, setCurrentPage] = useState(0);

  console.log('[useBinderPagination] Input:', {
    totalCards: cards.length,
    cardsPerPage,
    currentPage,
  });

  const totalPages = Math.max(1, Math.ceil(cards.length / cardsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages - 1);

  const currentCards = useMemo(() => {
    const start = validCurrentPage * cardsPerPage;
    const end = start + cardsPerPage;
    const sliced = cards.slice(start, end);
    
    console.log('[useBinderPagination] Slicing cards:', {
      start,
      end,
      slicedCount: sliced.length,
      validCurrentPage,
      totalPages,
    });
    
    return sliced;
  }, [cards, validCurrentPage, cardsPerPage, totalPages]);

  const goToPage = (page: number) => {
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    console.log('[useBinderPagination] goToPage:', { requested: page, actual: newPage });
    setCurrentPage(newPage);
  };

  const nextPage = () => {
    if (validCurrentPage < totalPages - 1) {
      console.log('[useBinderPagination] nextPage:', validCurrentPage, '->', validCurrentPage + 1);
      setCurrentPage(validCurrentPage + 1);
    } else {
      console.log('[useBinderPagination] nextPage: Already at last page');
    }
  };

  const prevPage = () => {
    if (validCurrentPage > 0) {
      console.log('[useBinderPagination] prevPage:', validCurrentPage, '->', validCurrentPage - 1);
      setCurrentPage(validCurrentPage - 1);
    } else {
      console.log('[useBinderPagination] prevPage: Already at first page');
    }
  };

  return {
    currentPage: validCurrentPage,
    totalPages,
    currentCards,
    goToPage,
    nextPage,
    prevPage,
    hasNext: validCurrentPage < totalPages - 1,
    hasPrev: validCurrentPage > 0,
  };
}
