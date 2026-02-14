import type { BinderTheme } from '../../backend';

export function getDefaultTheme(): BinderTheme {
  return {
    coverColor: '#F4E8D8',
    coverTexture: '/assets/generated/binder-cover-beige-texture.dim_2048x2048.png',
    pageBackground: '#FFF8F0',
    cardFrameStyle: 'solid',
    textColor: '#4A4A4A',
    accentColor: '#C89B7B',
    borderStyle: 'solid',
    backgroundPattern: '/assets/generated/binder-page-light-texture.dim_2048x2048.png',
  };
}
