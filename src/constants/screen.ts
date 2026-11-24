import { Platform, StyleSheet } from 'react-native';

export const screenPadding = 16;

/** Нижний inset: на Android 3-кнопочная панель часто не даёт safe area → 48dp запас. */
function effectiveBottomInset(safeAreaBottom: number): number {
  if (Platform.OS === 'android' && safeAreaBottom < 16) {
    return 48;
  }
  return safeAreaBottom;
}

/** Отступ FAB и запас под список с учётом системной панели снизу (Android). */
export function fabBottomInset(safeAreaBottom: number): number {
  return screenPadding + effectiveBottomInset(safeAreaBottom);
}

export function listBottomInsetForFab(safeAreaBottom: number): number {
  return 88 + effectiveBottomInset(safeAreaBottom);
}

export const screenStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    padding: screenPadding,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: screenPadding,
    gap: 8,
  },
});