import {
  getConditionStickerPath,
  getRarityBadgePath,
  getGlintOverlayPath,
  shouldShowGlint,
} from '../../features/cards/overlayAssets';
import type { Photocard } from '../../backend';

interface BinderPageExportCanvasProps {
  cards: Array<{ card: Photocard; imageDataUrl: string }>;
  pageBackground: string;
}

/**
 * Chrome-free render component for exporting a single binder page.
 * Displays a 12-card grid with overlays (condition, rarity, glint) but no UI controls.
 */
export default function BinderPageExportCanvas({
  cards,
  pageBackground,
}: BinderPageExportCanvasProps) {
  return (
    <div
      className="w-[1200px] h-[1600px] p-16"
      style={{ backgroundColor: pageBackground }}
    >
      <div className="grid grid-cols-3 gap-8 w-full h-full">
        {cards.map(({ card, imageDataUrl }) => {
          const conditionStickerPath = getConditionStickerPath(card.condition);
          const rarityBadgePath = getRarityBadgePath(card.rarity);
          const showGlint = shouldShowGlint(card.rarity);

          return (
            <div
              key={card.id}
              className="relative aspect-[2/3] bg-white rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg"
            >
              {/* Card image */}
              <div className="relative w-full h-full">
                <img
                  src={imageDataUrl}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />

                {/* Holographic glint overlay for legendary cards */}
                {showGlint && (
                  <img
                    src={getGlintOverlayPath()}
                    alt="Holographic glint"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ opacity: 0.5 }}
                    crossOrigin="anonymous"
                  />
                )}

                {/* Condition sticker - top right, -5 degree rotation */}
                {conditionStickerPath && (
                  <img
                    src={conditionStickerPath}
                    alt="Condition"
                    className="absolute top-2 right-2 w-16 h-16 object-contain pointer-events-none"
                    style={{ transform: 'rotate(-5deg)' }}
                    crossOrigin="anonymous"
                  />
                )}

                {/* Rarity badge - bottom left */}
                {rarityBadgePath && (
                  <img
                    src={rarityBadgePath}
                    alt="Rarity"
                    className="absolute bottom-2 left-2 w-12 h-12 object-contain pointer-events-none"
                    crossOrigin="anonymous"
                  />
                )}
              </div>

              {/* Quantity badge */}
              {card.quantity > 1 && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ×{card.quantity}
                </div>
              )}
            </div>
          );
        })}

        {/* Fill empty slots with placeholder cards */}
        {Array.from({ length: Math.max(0, 12 - cards.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="relative aspect-[2/3] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300"
          />
        ))}
      </div>
    </div>
  );
}
