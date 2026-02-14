import { useEffect, useState } from 'react';

const STORAGE_KEY = 'binder-accent-color';

export type AccentColor = 'default' | 'coral' | 'sage' | 'lavender' | 'rose' | 'teal';

interface AccentColorConfig {
  accent: string;
  accentHover: string;
}

const ACCENT_COLORS: Record<AccentColor, AccentColorConfig | null> = {
  default: null, // No override, use CSS defaults
  coral: {
    accent: '0.65 0.15 25', // Warm coral
    accentHover: '0.58 0.14 25',
  },
  sage: {
    accent: '0.75 0.08 140', // Soft sage green
    accentHover: '0.68 0.10 140',
  },
  lavender: {
    accent: '0.70 0.12 280', // Soft lavender
    accentHover: '0.63 0.14 280',
  },
  rose: {
    accent: '0.68 0.14 350', // Dusty rose
    accentHover: '0.61 0.16 350',
  },
  teal: {
    accent: '0.72 0.10 190', // Soft teal
    accentHover: '0.65 0.12 190',
  },
};

export function useAccentColor() {
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in ACCENT_COLORS) {
        return stored as AccentColor;
      }
    } catch (e) {
      console.error('Failed to read accent color from localStorage:', e);
    }
    return 'default';
  });

  useEffect(() => {
    const config = ACCENT_COLORS[accentColor];
    
    if (config) {
      // Apply accent color overrides
      document.documentElement.style.setProperty('--binder-accent', config.accent);
      document.documentElement.style.setProperty('--binder-accent-hover', config.accentHover);
    } else {
      // Remove overrides to fall back to CSS defaults
      document.documentElement.style.removeProperty('--binder-accent');
      document.documentElement.style.removeProperty('--binder-accent-hover');
    }
  }, [accentColor]);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    try {
      localStorage.setItem(STORAGE_KEY, color);
    } catch (e) {
      console.error('Failed to save accent color to localStorage:', e);
    }
  };

  return {
    accentColor,
    setAccentColor,
  };
}
