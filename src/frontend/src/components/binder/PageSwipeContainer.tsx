import { ReactNode, useState, useEffect } from 'react';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';

interface PageSwipeContainerProps {
  children: ReactNode;
  currentPage: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function PageSwipeContainer({
  children,
  currentPage,
  onSwipeLeft,
  onSwipeRight,
}: PageSwipeContainerProps) {
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [prevPage, setPrevPage] = useState(currentPage);

  useEffect(() => {
    if (currentPage !== prevPage) {
      setDirection(currentPage > prevPage ? 'left' : 'right');
      setPrevPage(currentPage);
      
      const timer = setTimeout(() => {
        setDirection(null);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, prevPage]);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    threshold: 50,
  });

  return (
    <div
      className="relative overflow-hidden"
      {...swipeHandlers}
    >
      <div
        className={`transition-all duration-500 ease-out ${
          direction === 'left'
            ? 'animate-page-flip-left'
            : direction === 'right'
            ? 'animate-page-flip-right'
            : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
