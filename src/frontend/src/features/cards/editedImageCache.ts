const CACHE_PREFIX = 'edited_card_';

export function saveEditedImage(cardId: string, imageUrl: string): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${cardId}`, imageUrl);
  } catch (error) {
    console.warn('Failed to save edited image to cache:', error);
  }
}

export function getEditedImage(cardId: string): string | null {
  try {
    return localStorage.getItem(`${CACHE_PREFIX}${cardId}`);
  } catch (error) {
    console.warn('Failed to retrieve edited image from cache:', error);
    return null;
  }
}

export function clearEditedImage(cardId: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${cardId}`);
  } catch (error) {
    console.warn('Failed to clear edited image from cache:', error);
  }
}

export function clearAllEditedImages(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear all edited images from cache:', error);
  }
}
