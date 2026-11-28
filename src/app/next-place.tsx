import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { type Href, router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTranslation } from 'react-i18next';

import { ScreenShell } from '@/components/ScreenShell';
import { ScreenEmpty, ScreenLoading } from '@/components/ScreenStatus';
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
  const { t } = useTranslation();
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
      setSnackbar(t('nextPlace.stopNotInCatalog'));
      setLoading(false);
      return;
    }

    setNext({ trip, stop, place });
    setLoading(false);
  }, [db, t]);

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
      setSnackbar(t('nextPlace.mapNeedsCoords'));
      return;
    }
    try {
      await openPlaceOnMap(coords.latitude, coords.longitude, next.place.name);
    } catch {
      setSnackbar(t('nextPlace.mapOpenFailed'));
    }
  };

  const openNavigator = async () => {
    if (!next) {
      return;
    }
    const coords = getCoordinates(next.place.latitude, next.place.longitude);
    if (!coords) {
      setSnackbar(t('nextPlace.navNeedsCoords'));
      return;
    }
    try {
      await openPlaceInNavigator(coords.latitude, coords.longitude, next.place.name);
    } catch {
      setSnackbar(t('nextPlace.navOpenFailed'));
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
      setSnackbar(t('nextPlace.markFailed'));
    } finally {
      setMarking(false);
    }
  };

  const nextCoords = next ? getCoordinates(next.place.latitude, next.place.longitude) : null;

  return (
    <ScreenShell title={t('nextPlace.title')} showBack>
      {loading ? (
        <ScreenLoading />
      ) : noCurrentTrip ? (
        <ScreenEmpty title={t('nextPlace.noCurrentTitle')} hint={t('nextPlace.noCurrentHint')}>
          <Button mode="tonal" onPress={() => router.push('/trips' as Href)}>
            {t('nextPlace.goTrips')}
          </Button>
        </ScreenEmpty>
      ) : allVisited ? (
        <ScreenEmpty
          title={t('nextPlace.allVisitedTitle')}
          hint={t('nextPlace.allVisitedHint', { title: allVisited.trip.title })}
        >
          <Button
            mode="tonal"
            onPress={() => router.push(`/trips/${allVisited.trip.id}` as Href)}
          >
            {t('nextPlace.openTrip')}
          </Button>
        </ScreenEmpty>
      ) : next ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text variant="labelLarge" style={styles.meta}>
            {t('nextPlace.tripLabel', { title: next.trip.title })}
          </Text>
          <Text variant="headlineSmall">{next.place.name}</Text>
          <Text variant="bodyLarge">{next.place.description || t('common.noDescription')}</Text>
          <Text variant="bodyMedium" style={styles.meta}>
            {nextCoords
              ? t('common.coordsLine', { lat: next.place.latitude, lon: next.place.longitude })
              : t('common.coordsUnset')}
          </Text>
          <Button mode="tonal" icon="map" onPress={() => void openMap()}>
            {t('nextPlace.onMap')}
          </Button>
          <Button mode="tonal" icon="navigation" onPress={() => void openNavigator()}>
            {t('nextPlace.navigator')}
          </Button>
          <Button mode="filled" icon="check" loading={marking} onPress={() => void markVisited()}>
            {t('nextPlace.markVisited')}
          </Button>
          <Button mode="text" onPress={() => router.push(`/places/${next.place.id}` as Href)}>
            {t('nextPlace.placeCard')}
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
  meta: {
    opacity: 0.85,
  },
});