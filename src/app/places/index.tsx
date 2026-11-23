import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, List, Text } from 'react-native-paper';
import { type Href, router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ScreenShell } from '@/components/ScreenShell';
import { screenPadding } from '@/constants/screen';
import { listPlaces } from '@/repositories/places';
import type { Place } from '@/types/entities';

export default function PlacesListScreen() {
  const db = useSQLiteContext();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await listPlaces(db);
    setPlaces(rows);
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <ScreenShell title="Места" showBack>
      {loading && places.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge">Загрузка…</Text>
        </View>
      ) : places.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Пока нет мест
          </Text>
          <Text variant="bodyMedium" style={styles.emptyHint}>
            Добавьте интересные точки для будущих поездок.
          </Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.description || 'Без описания'}
              descriptionNumberOfLines={2}
              onPress={() => router.push(`/places/${item.id}` as Href)}
              right={() =>
                item.visitLater || item.liked ? (
                  <View style={styles.badges}>
                    {item.visitLater ? <Text variant="labelSmall">★ позже</Text> : null}
                    {item.liked ? <Text variant="labelSmall">♥</Text> : null}
                  </View>
                ) : null
              }
            />
          )}
        />
      )}
      <FAB
        icon="plus"
        aria-label="Добавить место"
        style={styles.fab}
        onPress={() => router.push('/places/form' as Href)}
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
  badges: {
    justifyContent: 'center',
    paddingRight: screenPadding,
    gap: 4,
    alignItems: 'flex-end',
  },
  fab: {
    position: 'absolute',
    right: screenPadding,
    bottom: screenPadding,
  },
});