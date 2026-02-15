import { CardCondition, CardRarity } from '../../backend';

/**
 * Maps card condition values to their corresponding sticker asset paths.
 * Returns a safe default for unknown or none values.
 */
export function getConditionStickerPath(condition: CardCondition): string | null {
  switch (condition) {
    case CardCondition.mint:
      return '/assets/generated/price-tag-mint.dim_512x512.png';
    case CardCondition.nearMint:
      return '/assets/generated/price-tag-near-mint.dim_512x512.png';
    case CardCondition.played:
      return '/assets/generated/price-tag-played.dim_512x512.png';
    case CardCondition.good:
    case CardCondition.fair:
      // Fallback to played for good/fair conditions
      return '/assets/generated/price-tag-played.dim_512x512.png';
    case CardCondition.none:
    default:
      return null;
  }
}

/**
 * Maps card rarity values to their corresponding badge asset paths.
 * Returns a safe default for unknown or none values.
 */
export function getRarityBadgePath(rarity: CardRarity): string | null {
  switch (rarity) {
    case CardRarity.common:
      return '/assets/generated/rarity-common.dim_128x128.png';
    case CardRarity.rare:
      return '/assets/generated/rarity-rare.dim_128x128.png';
    case CardRarity.legendary:
      return '/assets/generated/rarity-legendary.dim_128x128.png';
    case CardRarity.ultraRare:
      return '/assets/generated/rarity-epic.dim_128x128.png';
    case CardRarity.none:
    default:
      return null;
  }
}

/**
 * Returns the holographic glint overlay image path for legendary cards.
 */
export function getGlintOverlayPath(): string {
  return '/assets/generated/stickers-pack-01.dim_1024x1024.png';
}

/**
 * Checks if a card should display the holographic glint overlay.
 */
export function shouldShowGlint(rarity: CardRarity): boolean {
  return rarity === CardRarity.legendary;
}
