export type StickerType = 'star' | 'heart' | 'sparkle' | 'tape' | 'flower' | 'smiley';

export interface StickerData {
  type: StickerType;
  label: string;
  image: HTMLImageElement | null;
  width: number;
  height: number;
}

const STICKER_SHEET_URL = '/assets/generated/stickers-pack-01.dim_1024x1024.png';
const STICKER_SIZE = 170;

function loadStickerImage(x: number, y: number): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = STICKER_SIZE;
  canvas.height = STICKER_SIZE;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (ctx) {
      ctx.drawImage(img, x, y, STICKER_SIZE, STICKER_SIZE, 0, 0, STICKER_SIZE, STICKER_SIZE);
    }
  };
  img.src = STICKER_SHEET_URL;

  const stickerImg = new Image();
  stickerImg.src = canvas.toDataURL();
  return stickerImg;
}

export const STICKERS: StickerData[] = [
  {
    type: 'star',
    label: 'Star',
    image: loadStickerImage(0, 0),
    width: STICKER_SIZE,
    height: STICKER_SIZE,
  },
  {
    type: 'heart',
    label: 'Heart',
    image: loadStickerImage(170, 0),
    width: STICKER_SIZE,
    height: STICKER_SIZE,
  },
  {
    type: 'sparkle',
    label: 'Sparkle',
    image: loadStickerImage(340, 0),
    width: STICKER_SIZE,
    height: STICKER_SIZE,
  },
  {
    type: 'tape',
    label: 'Tape',
    image: loadStickerImage(0, 170),
    width: STICKER_SIZE,
    height: STICKER_SIZE,
  },
  {
    type: 'flower',
    label: 'Flower',
    image: loadStickerImage(170, 170),
    width: STICKER_SIZE,
    height: STICKER_SIZE,
  },
  {
    type: 'smiley',
    label: 'Smiley',
    image: loadStickerImage(340, 170),
    width: STICKER_SIZE,
    height: STICKER_SIZE,
  },
];
