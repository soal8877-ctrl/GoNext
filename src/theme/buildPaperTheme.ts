import { DarkTheme, LightTheme } from 'react-native-paper';
import type { Theme } from 'react-native-paper';

import {
  getPrimaryColorPreset,
  type PrimaryColorPreset,
} from '@/theme/primaryColorPresets';
import type { ThemeMode } from '@/theme/ThemePreferenceContext';

export function buildPaperTheme(mode: ThemeMode, preset: PrimaryColorPreset): Theme {
  const base = mode === 'dark' ? DarkTheme : LightTheme;
  const isDark = mode === 'dark';

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: preset.primary,
      onPrimary: preset.onPrimary,
      primaryContainer: isDark ? preset.primaryContainerDark : preset.primaryContainerLight,
      onPrimaryContainer: isDark
        ? preset.onPrimaryContainerDark
        : preset.onPrimaryContainerLight,
      secondaryContainer: isDark
        ? preset.secondaryContainerDark
        : preset.secondaryContainerLight,
      onSecondaryContainer: isDark
        ? preset.onSecondaryContainerDark
        : preset.onSecondaryContainerLight,
    },
  };
}

export function buildPaperThemeById(mode: ThemeMode, presetId: string): Theme {
  return buildPaperTheme(mode, getPrimaryColorPreset(presetId));
}