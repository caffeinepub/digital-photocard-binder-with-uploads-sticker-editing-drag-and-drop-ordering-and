import { useState, useMemo } from 'react';
import type { Photocard } from '../backend';

export function useBinderPagination(cards: Photocard[], cardsPerPage: number = 12) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(cards.length / cardsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages - 1);

  const currentCards = useMemo(() => {
    const start = validCurrentPage * cardsPerPage;
    const end = start + cardsPerPage;
    return cards.slice(start, end);
  }, [cards, validCurrentPage, cardsPerPage]);

  const goToPage = (page: number) => {
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(newPage);
  };

  const nextPage = () => {
    if (validCurrentPage < totalPages - 1) {
      setCurrentPage(validCurrentPage + 1);
    }
  };

  const prevPage = () => {
    if (validCurrentPage > 0) {
      setCurrentPage(validCurrentPage - 1);
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
