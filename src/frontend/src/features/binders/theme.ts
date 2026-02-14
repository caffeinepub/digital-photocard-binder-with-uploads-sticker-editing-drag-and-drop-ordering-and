import type { BinderTheme } from '../../backend';

export function getDefaultTheme(): BinderTheme {
  return {
    coverColor: '#F4E8D8',
    coverTexture: undefined,
    pageBackground: '#FFF8F0',
    cardFrameStyle: 'solid',
    textColor: '#3D3D3D',
    accentColor: '#E07A5F',
    borderStyle: 'solid',
    backgroundPattern: undefined,
  };
}
