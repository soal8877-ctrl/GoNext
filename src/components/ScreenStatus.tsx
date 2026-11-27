import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

import { screenPadding } from '@/constants/screen';

/** Единый индикатор загрузки данных экрана (этап 8). */
export function ScreenLoading() {
  const theme = useTheme();

  return (
    <View style={styles.centered} accessibilityRole="progressbar" accessibilityLabel="Загрузка">
      <ActivityIndicator animating size="large" />
      <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        Загрузка…
      </Text>
    </View>
  );
}

type ScreenEmptyProps = {
  title: string;
  hint?: string;
  children?: ReactNode;
};

/** Пустое состояние или сообщение об отсутствии данных. */
export function ScreenEmpty({ title, hint, children }: ScreenEmptyProps) {
  return (
    <View style={styles.centered}>
      <Text variant="titleMedium" style={styles.emptyTitle}>
        {title}
      </Text>
      {hint ? (
        <Text variant="bodyMedium" style={styles.emptyHint}>
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: screenPadding,
    gap: 12,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyHint: {
    textAlign: 'center',
    opacity: 0.75,
  },
});