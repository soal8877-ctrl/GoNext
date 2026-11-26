import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Portal,
  Snackbar,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';
import { type Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { PhotoGallery } from '@/components/PhotoGallery';
import { ScreenShell } from '@/components/ScreenShell';
import { deletePhotoFileAsync } from '@/photos/storage';
import { screenPadding } from '@/constants/screen';
import { listPlaces } from '@/repositories/places';
import {
  addPlaceToTrip,
  listTripPlacesWithPlaces,
  moveTripPlace,
  removePlaceFromTrip,
  updateTripPlace,
  type TripPlaceWithPlace,
} from '@/repositories/tripPlaces';
import { getTripById } from '@/repositories/trips';
import type { Place, Trip } from '@/types/entities';
import { formatDateDisplay, formatTripDateRange, parseOptionalIsoDate, todayIsoDate } from '@/utils/dates';

export default function TripDetailScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<TripPlaceWithPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [removeStopTarget, setRemoveStopTarget] = useState<TripPlaceWithPlace | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(tripId)) {
      setTrip(null);
      setStops([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [tripRow, route] = await Promise.all([
      getTripById(db, tripId),
      listTripPlacesWithPlaces(db, tripId),
    ]);
    setTrip(tripRow);
    setStops(route);
    setLoading(false);
  }, [db, tripId]);

  const loadPlacesForPicker = useCallback(async () => {
    const places = await listPlaces(db);
    setAllPlaces(places);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const usedPlaceIds = useMemo(() => new Set(stops.map((s) => s.placeId)), [stops]);

  const availablePlaces = useMemo(
    () => allPlaces.filter((place) => !usedPlaceIds.has(place.id)),
    [allPlaces, usedPlaceIds]
  );

  const openAddDialog = () => {
    void loadPlacesForPicker();
    setAddDialogVisible(true);
  };

  const addPlace = async (placeId: number) => {
    try {
      await addPlaceToTrip(db, { tripId, placeId });
      setAddDialogVisible(false);
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes('UNIQUE') || message.includes('constraint')) {
        setSnackbar('Это место уже в маршруте.');
      } else {
        setSnackbar('Не удалось добавить место.');
      }
    }
  };

  const toggleVisited = async (stop: TripPlaceWithPlace, visited: boolean) => {
    const visitDate =
      visited && !stop.visitDate ? todayIsoDate() : visited ? stop.visitDate : null;
    const updated = await updateTripPlace(db, stop.id, { visited, visitDate });
    if (updated) {
      await load();
    }
  };

  const saveVisitDate = async (stop: TripPlaceWithPlace, text: string) => {
    const parsed = parseOptionalIsoDate(text);
    if (!parsed.ok) {
      setSnackbar(parsed.message);
      return;
    }
    await updateTripPlace(db, stop.id, { visitDate: parsed.value });
    await load();
  };

  const saveNotes = async (stop: TripPlaceWithPlace, notes: string) => {
    await updateTripPlace(db, stop.id, { notes: notes.trim() });
    await load();
  };

  const moveStop = async (stopId: number, direction: 'up' | 'down') => {
    await moveTripPlace(db, stopId, direction);
    await load();
  };

  const confirmRemoveStop = async () => {
    if (!removeStopTarget) {
      return;
    }
    for (const path of removeStopTarget.photos) {
      await deletePhotoFileAsync(path);
    }
    await removePlaceFromTrip(db, removeStopTarget.id);
    setRemoveStopTarget(null);
    await load();
  };

  return (
    <ScreenShell title={trip?.title ?? 'Поездка'} showBack>
      {loading ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge">Загрузка…</Text>
        </View>
      ) : !trip ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge">Поездка не найдена.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {trip.current ? (
            <Chip icon="star" mode="flat" style={styles.currentChip}>
              Текущая поездка
            </Chip>
          ) : null}
          <Text variant="bodyMedium" style={styles.meta}>
            {formatTripDateRange(trip.startDate, trip.endDate)}
          </Text>
          {trip.description ? <Text variant="bodyLarge">{trip.description}</Text> : null}
          <Button
            mode="outlined"
            onPress={() => router.push(`/trips/form?id=${trip.id}` as Href)}
          >
            Редактировать поездку
          </Button>

          <Divider style={styles.sectionDivider} />
          <Text variant="titleMedium">Маршрут</Text>

          {stops.length === 0 ? (
            <Text variant="bodyMedium" style={styles.meta}>
              Добавьте места из справочника или создайте новое.
            </Text>
          ) : (
            stops.map((stop, index) => (
              <RouteStopCard
                key={`${stop.id}-${stop.order}-${stop.visited}-${stop.visitDate}-${stop.notes}`}
                stop={stop}
                index={index}
                total={stops.length}
                onToggleVisited={(value) => void toggleVisited(stop, value)}
                onSaveVisitDate={(text) => void saveVisitDate(stop, text)}
                onSaveNotes={(text) => void saveNotes(stop, text)}
                onMoveUp={() => void moveStop(stop.id, 'up')}
                onMoveDown={() => void moveStop(stop.id, 'down')}
                onRemove={() => setRemoveStopTarget(stop)}
                onOpenPlace={() => router.push(`/places/${stop.placeId}` as Href)}
                onPhotosChange={async (photos) => {
                  await updateTripPlace(db, stop.id, { photos });
                  await load();
                }}
                onNotify={(message) => setSnackbar(message)}
              />
            ))
          )}

          <Button mode="tonal" icon="plus" onPress={openAddDialog}>
            Добавить место в маршрут
          </Button>
        </ScrollView>
      )}

      <Portal>
        <Dialog visible={addDialogVisible} onDismiss={() => setAddDialogVisible(false)}>
          <Dialog.Title>Добавить место</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView>
              {availablePlaces.length === 0 ? (
                <Text variant="bodyMedium" style={styles.dialogHint}>
                  {allPlaces.length === 0
                    ? 'Справочник мест пуст. Создайте место ниже.'
                    : 'Все места уже в маршруте или справочник пуст.'}
                </Text>
              ) : (
                availablePlaces.map((place) => (
                  <Button
                    key={place.id}
                    mode="text"
                    contentStyle={styles.dialogItem}
                    onPress={() => void addPlace(place.id)}
                  >
                    {place.name}
                  </Button>
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setAddDialogVisible(false)}>Отмена</Button>
            <Button
              onPress={() => {
                setAddDialogVisible(false);
                router.push(`/places/form?tripId=${tripId}` as Href);
              }}
            >
              Создать новое
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={removeStopTarget != null} onDismiss={() => setRemoveStopTarget(null)}>
          <Dialog.Title>Убрать из маршрута?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              «{removeStopTarget?.placeName}» останется в справочнике мест.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRemoveStopTarget(null)}>Отмена</Button>
            <Button onPress={() => void confirmRemoveStop()}>Убрать</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={snackbar != null} onDismiss={() => setSnackbar(null)} duration={4000}>
        {snackbar}
      </Snackbar>
    </ScreenShell>
  );
}

type RouteStopCardProps = {
  stop: TripPlaceWithPlace;
  index: number;
  total: number;
  onToggleVisited: (value: boolean) => void;
  onSaveVisitDate: (text: string) => void;
  onSaveNotes: (text: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onOpenPlace: () => void;
  onPhotosChange: (photos: string[]) => Promise<void>;
  onNotify: (message: string) => void;
};

function RouteStopCard({
  stop,
  index,
  total,
  onToggleVisited,
  onSaveVisitDate,
  onSaveNotes,
  onMoveUp,
  onMoveDown,
  onRemove,
  onOpenPlace,
  onPhotosChange,
  onNotify,
}: RouteStopCardProps) {
  const [visitDateText, setVisitDateText] = useState(
    stop.visitDate ? formatDateDisplay(stop.visitDate) : ''
  );
  const [notesText, setNotesText] = useState(stop.notes);

  return (
    <View style={[styles.stopCard, stop.visited ? styles.stopVisited : styles.stopPlanned]}>
      <View style={styles.stopHeader}>
        <Text variant="titleSmall">
          {index + 1}. {stop.placeName}
        </Text>
        <Chip compact mode={stop.visited ? 'flat' : 'outlined'} icon={stop.visited ? 'check' : 'map-marker'}>
          {stop.visited ? 'Посещено' : 'В плане'}
        </Chip>
      </View>

      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Посетил</Text>
        <Switch value={stop.visited} onValueChange={onToggleVisited} />
      </View>

      <TextInput
        label="Дата визита"
        value={visitDateText}
        onChangeText={setVisitDateText}
        variant="outlined"
        placeholder="ДД.ММ.ГГГГ"
        onBlur={() => onSaveVisitDate(visitDateText)}
      />
      <TextInput
        label="Заметки"
        value={notesText}
        onChangeText={setNotesText}
        variant="outlined"
        multiline
        numberOfLines={3}
        onBlur={() => onSaveNotes(notesText)}
      />
      <PhotoGallery
        title="Фото визита"
        photos={stop.photos}
        category="trip-visits"
        ownerId={stop.id}
        onPhotosChange={onPhotosChange}
        onNotify={onNotify}
      />

      <View style={styles.stopActions}>
        <IconButton icon="chevron-up" disabled={index === 0} onPress={onMoveUp} />
        <IconButton icon="chevron-down" disabled={index >= total - 1} onPress={onMoveDown} />
        <IconButton icon="map-marker" onPress={onOpenPlace} />
        <IconButton icon="delete" onPress={onRemove} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: screenPadding,
    gap: 12,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: screenPadding,
  },
  meta: {
    opacity: 0.8,
  },
  currentChip: {
    alignSelf: 'flex-start',
  },
  sectionDivider: {
    marginVertical: 4,
  },
  stopCard: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C4C7C5',
  },
  stopPlanned: {
    backgroundColor: '#F3F4F6',
  },
  stopVisited: {
    backgroundColor: '#E8F5E9',
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stopActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dialogScroll: {
    maxHeight: 320,
    paddingHorizontal: 0,
  },
  dialogHint: {
    padding: screenPadding,
  },
  dialogItem: {
    justifyContent: 'flex-start',
  },
});