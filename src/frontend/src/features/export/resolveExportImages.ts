import { ExternalBlob } from '../../backend';
import { getEditedImage } from '../cards/editedImageCache';

/**
 * Converts an ExternalBlob to a data URL for reliable capture in PDF export.
 */
export async function blobToDataUrl(blob: ExternalBlob): Promise<string> {
  try {
    const bytes = await blob.getBytes();
    const uint8Array = new Uint8Array(bytes);
    const blobObj = new Blob([uint8Array], { type: 'image/jpeg' });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blobObj);
    });
  } catch (error) {
    console.error('Failed to convert blob to data URL:', error);
    throw error;
  }
}

/**
 * Resolves the best image source for a card (edited cache or original blob).
 * Returns a data URL suitable for PDF export.
 */
export async function resolveCardImageForExport(
  cardId: string,
  originalBlob: ExternalBlob
): Promise<string> {
  // Check for edited image in cache first
  const editedImage = getEditedImage(cardId);
  if (editedImage) {
    return editedImage; // Already a data URL
  }

  // Convert original blob to data URL
  return blobToDataUrl(originalBlob);
}

/**
 * Preloads an image to ensure it's ready for capture.
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preloads all overlay assets used in the binder page.
 */
export async function preloadOverlayAssets(): Promise<void> {
  const overlayPaths = [
    '/assets/generated/price-tag-mint.dim_512x512.png',
    '/assets/generated/price-tag-near-mint.dim_512x512.png',
    '/assets/generated/price-tag-played.dim_512x512.png',
    '/assets/generated/rarity-common.dim_128x128.png',
    '/assets/generated/rarity-rare.dim_128x128.png',
    '/assets/generated/rarity-legendary.dim_128x128.png',
    '/assets/generated/rarity-epic.dim_128x128.png',
    '/assets/generated/stickers-pack-01.dim_1024x1024.png',
  ];

  await Promise.all(overlayPaths.map(preloadImage));
}
