import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, List, Text } from 'react-native-paper';
import { type Href, router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenShell } from '@/components/ScreenShell';
import { ScreenEmpty, ScreenLoading } from '@/components/ScreenStatus';
import { fabBottomInset, listBottomInsetForFab, screenPadding } from '@/constants/screen';
import { listPlaces } from '@/repositories/places';
import type { Place } from '@/types/entities';

export default function PlacesListScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const fabBottom = fabBottomInset(insets.bottom);
  const listBottomPadding = listBottomInsetForFab(insets.bottom);

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
    <ScreenShell title={t('places.title')} showBack>
      {loading && places.length === 0 ? (
        <ScreenLoading />
      ) : places.length === 0 ? (
        <ScreenEmpty title={t('places.emptyTitle')} hint={t('places.emptyHint')} />
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPadding }]}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.description || t('common.noDescriptionShort')}
              descriptionNumberOfLines={2}
              onPress={() => router.push(`/places/${item.id}` as Href)}
              right={() =>
                item.visitLater || item.liked ? (
                  <View style={styles.badges}>
                    {item.visitLater ? <Text variant="labelSmall">{t('common.laterBadge')}</Text> : null}
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
        aria-label={t('places.fabAdd')}
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => router.push('/places/form' as Href)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 88,
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
  },
});