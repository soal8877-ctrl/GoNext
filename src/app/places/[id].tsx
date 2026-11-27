import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Switch, Text } from 'react-native-paper';
import { type Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { PhotoGallery } from '@/components/PhotoGallery';
import { ScreenShell } from '@/components/ScreenShell';
import { ScreenEmpty, ScreenLoading } from '@/components/ScreenStatus';
import { screenPadding } from '@/constants/screen';
import { deletePhotoFileAsync } from '@/photos/storage';
import { deletePlace, getPlaceById, updatePlace } from '@/repositories/places';
import type { Place } from '@/types/entities';
import { getCoordinates } from '@/utils/coordinates';
import { openPlaceOnMap } from '@/utils/maps';

export default function PlaceDetailScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const placeId = Number(id);

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(placeId)) {
      setPlace(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const row = await getPlaceById(db, placeId);
    setPlace(row);
    setLoading(false);
  }, [db, placeId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const toggleFlag = async (field: 'visitLater' | 'liked', value: boolean) => {
    if (!place) {
      return;
    }
    const updated = await updatePlace(db, place.id, { [field]: value });
    if (updated) {
      setPlace(updated);
    }
  };

  const onDelete = async () => {
    if (!place) {
      return;
    }
    setDeleting(true);
    try {
      for (const path of place.photos) {
        await deletePhotoFileAsync(path);
      }
      const ok = await deletePlace(db, place.id);
      if (!ok) {
        setSnackbar('Не удалось удалить место.');
        return;
      }
      setDeleteVisible(false);
      router.replace('/places' as Href);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes('FOREIGN KEY') || message.includes('constraint')) {
        setSnackbar('Место используется в поездке — сначала уберите его из маршрута.');
      } else {
        setSnackbar('Не удалось удалить место.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const openMap = async () => {
    if (!place) {
      return;
    }
    const coords = getCoordinates(place.latitude, place.longitude);
    if (!coords) {
      setSnackbar('Для карты укажите широту и долготу.');
      return;
    }
    try {
      await openPlaceOnMap(coords.latitude, coords.longitude, place.name);
    } catch {
      setSnackbar('Не удалось открыть карту.');
    }
  };

  return (
    <ScreenShell title={place?.name ?? 'Место'} showBack>
      {loading ? (
        <ScreenLoading />
      ) : !place ? (
        <ScreenEmpty title="Место не найдено" hint="Возможно, запись была удалена." />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text variant="bodyLarge">{place.description || 'Нет описания'}</Text>
          <Text variant="bodyMedium" style={styles.meta}>
            {getCoordinates(place.latitude, place.longitude)
              ? `Координаты: ${place.latitude}, ${place.longitude}`
              : 'Координаты не заданы'}
          </Text>
          <View style={styles.switchRow}>
            <Text variant="bodyLarge">Хочу посетить</Text>
            <Switch
              value={place.visitLater}
              onValueChange={(value) => void toggleFlag('visitLater', value)}
            />
          </View>
          <View style={styles.switchRow}>
            <Text variant="bodyLarge">Понравилось</Text>
            <Switch value={place.liked} onValueChange={(value) => void toggleFlag('liked', value)} />
          </View>
          <PhotoGallery
            photos={place.photos}
            category="places"
            ownerId={place.id}
            onPhotosChange={async (photos) => {
              const updated = await updatePlace(db, place.id, { photos });
              if (updated) {
                setPlace(updated);
              }
            }}
            onNotify={(message) => setSnackbar(message)}
          />
          <Button mode="tonal" icon="map" onPress={() => void openMap()}>
            На карте
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push(`/places/form?id=${place.id}` as Href)}
          >
            Редактировать
          </Button>
          <Button mode="text" textColor="#B3261E" onPress={() => setDeleteVisible(true)}>
            Удалить
          </Button>
        </ScrollView>
      )}

      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>Удалить место?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              «{place?.name}» будет удалено без возможности восстановления.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)}>Отмена</Button>
            <Button loading={deleting} disabled={deleting} onPress={() => void onDelete()}>
              Удалить
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={snackbar != null} onDismiss={() => setSnackbar(null)} duration={4000}>
        {snackbar}
      </Snackbar>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: screenPadding,
    gap: 16,
    paddingBottom: 32,
  },
  meta: {
    opacity: 0.8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    marginTop: 8,
  },
});