import { useState, useMemo } from 'react';
import type { Photocard } from '../backend';

const CARDS_PER_PAGE = 12;

export function useBinderPagination(cards: Photocard[]) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(cards.length / CARDS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages - 1);

  const currentCards = useMemo(() => {
    const start = validCurrentPage * CARDS_PER_PAGE;
    const end = start + CARDS_PER_PAGE;
    return cards.slice(start, end);
  }, [cards, validCurrentPage]);

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
