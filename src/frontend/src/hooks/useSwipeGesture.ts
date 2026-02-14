import { useRef, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: SwipeGestureOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);

    if (deltaX > deltaY && deltaX > 10) {
      isDragging.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || !isDragging.current) {
        touchStartX.current = null;
        touchStartY.current = null;
        isDragging.current = false;
        return;
      }

      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
      isDragging.current = false;
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = Math.abs(e.clientX - touchStartX.current);
    const deltaY = Math.abs(e.clientY - touchStartY.current);

    if (deltaX > deltaY && deltaX > 10) {
      isDragging.current = true;
    }
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (touchStartX.current === null || !isDragging.current) {
        touchStartX.current = null;
        touchStartY.current = null;
        isDragging.current = false;
        return;
      }

      const mouseEndX = e.clientX;
      const deltaX = mouseEndX - touchStartX.current;

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
      isDragging.current = false;
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
