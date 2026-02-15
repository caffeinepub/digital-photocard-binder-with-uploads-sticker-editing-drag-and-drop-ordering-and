import type { Photocard } from '../../backend';
import { resolveCardImageForExport, preloadOverlayAssets } from './resolveExportImages';
import { createRoot } from 'react-dom/client';
import BinderPageExportCanvas from '../../components/binder/BinderPageExportCanvas';

export type PageSize = 'a4' | 'letter';
export type QualityMode = 'standard' | 'high';

interface GeneratePdfOptions {
  binderName: string;
  pageNumber: number;
  cards: Photocard[];
  pageBackground: string;
  pageSize: PageSize;
  quality: QualityMode;
}

/**
 * Generates a PDF of a single binder page using the browser's print functionality.
 * This approach doesn't require external libraries and works reliably across browsers.
 */
export async function generateBinderPagePdf(
  options: GeneratePdfOptions
): Promise<void> {
  const { binderName, pageNumber, cards, pageBackground, pageSize } = options;

  // Preload overlay assets to prevent missing images
  await preloadOverlayAssets();

  // Resolve all card images to data URLs
  const resolvedCards = await Promise.all(
    cards.map(async (card) => ({
      card,
      imageDataUrl: await resolveCardImageForExport(card.id, card.image),
    }))
  );

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups for this site.');
  }

  // Build the HTML content
  const html = buildPrintHtml({
    binderName,
    pageNumber,
    cards: resolvedCards,
    pageBackground,
    pageSize,
  });

  // Write content to the new window
  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for images to load
  await new Promise<void>((resolve) => {
    printWindow.addEventListener('load', () => {
      setTimeout(resolve, 500);
    });
  });

  // Trigger print dialog
  printWindow.print();

  // Close the window after printing (user can cancel)
  printWindow.addEventListener('afterprint', () => {
    printWindow.close();
  });
}

interface BuildPrintHtmlOptions {
  binderName: string;
  pageNumber: number;
  cards: Array<{ card: Photocard; imageDataUrl: string }>;
  pageBackground: string;
  pageSize: PageSize;
}

function buildPrintHtml(options: BuildPrintHtmlOptions): string {
  const { binderName, pageNumber, cards, pageBackground, pageSize } = options;

  // Page dimensions
  const dimensions = pageSize === 'a4' 
    ? { width: '210mm', height: '297mm' }
    : { width: '8.5in', height: '11in' };

  // Build card HTML
  const cardsHtml = cards.map(({ card, imageDataUrl }) => {
    const conditionSticker = getConditionStickerHtml(card.condition);
    const rarityBadge = getRarityBadgeHtml(card.rarity);
    const glint = card.rarity === 'legendary' 
      ? `<img src="/assets/generated/stickers-pack-01.dim_1024x1024.png" alt="Glint" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.5; pointer-events: none;" crossorigin="anonymous" />`
      : '';
    const quantity = card.quantity > 1
      ? `<div style="position: absolute; top: 8px; right: 8px; background: #2563eb; color: white; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">×${card.quantity}</div>`
      : '';

    return `
      <div style="position: relative; aspect-ratio: 2/3; background: white; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="position: relative; width: 100%; height: 100%;">
          <img src="${imageDataUrl}" alt="${card.name}" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />
          ${glint}
          ${conditionSticker}
          ${rarityBadge}
        </div>
        ${quantity}
      </div>
    `;
  }).join('');

  // Fill empty slots
  const emptySlots = Math.max(0, 12 - cards.length);
  const emptySlotsHtml = Array.from({ length: emptySlots }).map(() => `
    <div style="position: relative; aspect-ratio: 2/3; background: #f3f4f6; border-radius: 12px; border: 2px dashed #d1d5db;"></div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${binderName} - Page ${pageNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        @page {
          size: ${dimensions.width} ${dimensions.height};
          margin: 0;
        }

        @media print {
          body {
            width: ${dimensions.width};
            height: ${dimensions.height};
          }

          .no-print {
            display: none !important;
          }
        }

        .page-container {
          width: ${dimensions.width};
          height: ${dimensions.height};
          padding: 40px;
          background: ${pageBackground};
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
          height: 100%;
        }

        @media screen {
          body {
            background: #f3f4f6;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }

          .instructions {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            text-align: center;
          }

          .instructions p {
            margin: 0;
            font-size: 14px;
            color: #374151;
          }

          .instructions strong {
            color: #1f2937;
          }
        }
      </style>
    </head>
    <body>
      <div class="instructions no-print">
        <p><strong>Ready to save as PDF!</strong></p>
        <p>Use your browser's print dialog and select "Save as PDF" as the destination.</p>
      </div>
      
      <div class="page-container">
        <div class="grid">
          ${cardsHtml}
          ${emptySlotsHtml}
        </div>
      </div>
    </body>
    </html>
  `;
}

function getConditionStickerHtml(condition: string): string {
  const paths: Record<string, string> = {
    mint: '/assets/generated/price-tag-mint.dim_512x512.png',
    nearMint: '/assets/generated/price-tag-near-mint.dim_512x512.png',
    played: '/assets/generated/price-tag-played.dim_512x512.png',
    good: '/assets/generated/price-tag-played.dim_512x512.png',
    fair: '/assets/generated/price-tag-played.dim_512x512.png',
  };

  const path = paths[condition];
  if (!path) return '';

  return `<img src="${path}" alt="Condition" style="position: absolute; top: 8px; right: 8px; width: 48px; height: 48px; object-fit: contain; transform: rotate(-5deg); pointer-events: none;" crossorigin="anonymous" />`;
}

function getRarityBadgeHtml(rarity: string): string {
  const paths: Record<string, string> = {
    common: '/assets/generated/rarity-common.dim_128x128.png',
    rare: '/assets/generated/rarity-rare.dim_128x128.png',
    legendary: '/assets/generated/rarity-legendary.dim_128x128.png',
    ultraRare: '/assets/generated/rarity-epic.dim_128x128.png',
  };

  const path = paths[rarity];
  if (!path) return '';

  return `<img src="${path}" alt="Rarity" style="position: absolute; bottom: 8px; left: 8px; width: 32px; height: 32px; object-fit: contain; pointer-events: none;" crossorigin="anonymous" />`;
}
