'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useTheme } from './theme.store';

export enum ColorScheme {
  MONOCHROME = 'monochrome',
  SUNSET = 'sunset',
  OCEAN = 'ocean',
  FOREST = 'forest',
  VIOLET = 'violet',
  PURPLE = 'purple'
}

interface ColorSchemeStore {
  colorScheme: ColorScheme;

  setColorScheme: (colorScheme: ColorScheme) => void;
}

export const useColorSchemeStore = create(
  persist<ColorSchemeStore>(
    (set) => ({
      colorScheme: ColorScheme.SUNSET,
      setColorScheme: (colorScheme) => set({ colorScheme })
    }),
    { name: 'color-scheme', storage: createJSONStorage(() => localStorage) }
  )
);

export const useColorScheme = () => {
  const { colorScheme, setColorScheme } = useColorSchemeStore((state) => state);
  const { theme } = useTheme();
  const root = document.documentElement;

  useEffect(() => {
    if (!theme) return;
    root.classList.remove(...Object.values(ColorScheme).map((scheme) => `color-scheme-${scheme}`));
    root.classList.add(`color-scheme-${colorScheme}`);
  }, [colorScheme, theme]);

  return {
    colorScheme,
    setColorScheme
  };
};
