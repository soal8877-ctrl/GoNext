import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { type Href, router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ScreenShell } from '@/components/ScreenShell';
import { screenPadding } from '@/constants/screen';
import { getPlaceById } from '@/repositories/places';
import { getNextUnvisitedTripPlace, updateTripPlace } from '@/repositories/tripPlaces';
import { getCurrentTrip } from '@/repositories/trips';
import type { Place, Trip, TripPlace } from '@/types/entities';
import { getCoordinates } from '@/utils/coordinates';
import { todayIsoDate } from '@/utils/dates';
import { openPlaceInNavigator, openPlaceOnMap } from '@/utils/maps';

type NextStopState = {
  trip: Trip;
  stop: TripPlace;
  place: Place;
} | null;

export default function NextPlaceScreen() {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [noCurrentTrip, setNoCurrentTrip] = useState(false);
  const [allVisited, setAllVisited] = useState<{ trip: Trip } | null>(null);
  const [next, setNext] = useState<NextStopState>(null);
  const [marking, setMarking] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNoCurrentTrip(false);
    setAllVisited(null);
    setNext(null);

    const trip = await getCurrentTrip(db);
    if (!trip) {
      setNoCurrentTrip(true);
      setLoading(false);
      return;
    }

    const stop = await getNextUnvisitedTripPlace(db, trip.id);
    if (!stop) {
      setAllVisited({ trip });
      setLoading(false);
      return;
    }

    const place = await getPlaceById(db, stop.placeId);
    if (!place) {
      setSnackbar('Место из маршрута не найдено в справочнике.');
      setLoading(false);
      return;
    }

    setNext({ trip, stop, place });
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const openMap = async () => {
    if (!next) {
      return;
    }
    const coords = getCoordinates(next.place.latitude, next.place.longitude);
    if (!coords) {
      setSnackbar('Для карты укажите координаты в карточке места.');
      return;
    }
    try {
      await openPlaceOnMap(coords.latitude, coords.longitude, next.place.name);
    } catch {
      setSnackbar('Не удалось открыть карту.');
    }
  };

  const openNavigator = async () => {
    if (!next) {
      return;
    }
    const coords = getCoordinates(next.place.latitude, next.place.longitude);
    if (!coords) {
      setSnackbar('Для навигатора укажите координаты в карточке места.');
      return;
    }
    try {
      await openPlaceInNavigator(coords.latitude, coords.longitude, next.place.name);
    } catch {
      setSnackbar('Не удалось открыть навигатор.');
    }
  };

  const markVisited = async () => {
    if (!next) {
      return;
    }
    setMarking(true);
    try {
      await updateTripPlace(db, next.stop.id, {
        visited: true,
        visitDate: todayIsoDate(),
      });
      await load();
    } catch {
      setSnackbar('Не удалось отметить посещение.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <ScreenShell title="Следующее место" showBack>
      {loading ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge">Загрузка…</Text>
        </View>
      ) : noCurrentTrip ? (
        <View style={styles.centered}>
          <Text variant="titleMedium" style={styles.message}>
            Нет текущей поездки
          </Text>
          <Text variant="bodyMedium" style={styles.hint}>
            Назначьте поездку текущей в разделе «Поездки», чтобы увидеть следующую точку маршрута.
          </Text>
          <Button mode="tonal" onPress={() => router.push('/trips' as Href)}>
            К поездкам
          </Button>
        </View>
      ) : allVisited ? (
        <View style={styles.centered}>
          <Text variant="titleMedium" style={styles.message}>
            Маршрут пройден
          </Text>
          <Text variant="bodyMedium" style={styles.hint}>
            В поездке «{allVisited.trip.title}» все места отмечены как посещённые.
          </Text>
          <Button
            mode="tonal"
            onPress={() => router.push(`/trips/${allVisited.trip.id}` as Href)}
          >
            Открыть поездку
          </Button>
        </View>
      ) : next ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text variant="labelLarge" style={styles.meta}>
            Поездка: {next.trip.title}
          </Text>
          <Text variant="headlineSmall">{next.place.name}</Text>
          <Text variant="bodyLarge">{next.place.description || 'Нет описания'}</Text>
          <Text variant="bodyMedium" style={styles.meta}>
            {getCoordinates(next.place.latitude, next.place.longitude)
              ? `Координаты: ${next.place.latitude}, ${next.place.longitude}`
              : 'Координаты не заданы'}
          </Text>
          <Button mode="tonal" icon="map" onPress={() => void openMap()}>
            На карте
          </Button>
          <Button mode="tonal" icon="navigation" onPress={() => void openNavigator()}>
            Навигатор
          </Button>
          <Button mode="filled" icon="check" loading={marking} onPress={() => void markVisited()}>
            Отметить посещённым
          </Button>
          <Button mode="text" onPress={() => router.push(`/places/${next.place.id}` as Href)}>
            Карточка места
          </Button>
        </ScrollView>
      ) : null}

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: screenPadding,
    gap: 12,
  },
  message: {
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    opacity: 0.8,
  },
  meta: {
    opacity: 0.85,
  },
});