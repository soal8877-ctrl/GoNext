import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Chip, FAB, List, Text } from 'react-native-paper';
import { type Href, router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenShell } from '@/components/ScreenShell';
import { fabBottomInset, listBottomInsetForFab, screenPadding } from '@/constants/screen';
import { listTrips } from '@/repositories/trips';
import type { Trip } from '@/types/entities';
import { formatTripDateRange } from '@/utils/dates';

export default function TripsListScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const fabBottom = fabBottomInset(insets.bottom);
  const listBottomPadding = listBottomInsetForFab(insets.bottom);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await listTrips(db);
    setTrips(rows);
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <ScreenShell title="Поездки" showBack>
      {loading && trips.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge">Загрузка…</Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Пока нет поездок
          </Text>
          <Text variant="bodyMedium" style={styles.emptyHint}>
            Спланируйте маршрут и отмечайте посещённые места по ходу пути.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPadding }]}
          renderItem={({ item }) => (
            <List.Item
              title={item.title}
              description={formatTripDateRange(item.startDate, item.endDate)}
              descriptionNumberOfLines={2}
              onPress={() => router.push(`/trips/${item.id}` as Href)}
              right={() =>
                item.current ? (
                  <View style={styles.badge}>
                    <Chip compact mode="flat">
                      Текущая
                    </Chip>
                  </View>
                ) : null
              }
            />
          )}
        />
      )}
      <FAB
        icon="plus"
        aria-label="Добавить поездку"
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => router.push('/trips/form' as Href)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 88,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: screenPadding,
    gap: 8,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyHint: {
    textAlign: 'center',
    opacity: 0.75,
  },
  badge: {
    justifyContent: 'center',
    paddingRight: screenPadding,
  },
  fab: {
    position: 'absolute',
    right: screenPadding,
  },
});