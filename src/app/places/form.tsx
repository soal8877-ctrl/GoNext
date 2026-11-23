import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Switch, Text, TextInput } from 'react-native-paper';
import { type Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ScreenShell } from '@/components/ScreenShell';
import { screenPadding } from '@/constants/screen';
import {
  formatCoordinatePairForInput,
  parseOptionalCoordinatePair,
} from '@/utils/coordinates';
import { createPlace, getPlaceById, updatePlace } from '@/repositories/places';

export default function PlaceFormScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const placeId = id ? Number(id) : null;
  const isEdit = placeId != null && Number.isFinite(placeId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitLater, setVisitLater] = useState(false);
  const [liked, setLiked] = useState(false);
  const [coordinatesText, setCoordinatesText] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const loadPlace = useCallback(async () => {
    if (!isEdit || placeId == null) {
      return;
    }
    setLoading(true);
    const place = await getPlaceById(db, placeId);
    if (!place) {
      setError('Место не найдено.');
      setLoading(false);
      return;
    }
    setName(place.name);
    setDescription(place.description);
    setVisitLater(place.visitLater);
    setLiked(place.liked);
    setCoordinatesText(formatCoordinatePairForInput(place.latitude, place.longitude));
    setLoading(false);
  }, [db, isEdit, placeId]);

  useFocusEffect(
    useCallback(() => {
      void loadPlace();
    }, [loadPlace])
  );

  const save = async () => {
    setFieldError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFieldError('Введите название места.');
      return;
    }

    const coords = parseOptionalCoordinatePair(coordinatesText);
    if (!coords.ok) {
      setFieldError(coords.message);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: trimmedName,
        description: description.trim(),
        visitLater,
        liked,
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      if (isEdit && placeId != null) {
        const updated = await updatePlace(db, placeId, payload);
        if (!updated) {
          setError('Не удалось сохранить изменения.');
          return;
        }
        router.replace(`/places/${placeId}` as Href);
      } else {
        const created = await createPlace(db, payload);
        router.replace(`/places/${created.id}` as Href);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell title={isEdit ? 'Редактировать место' : 'Новое место'} showBack>
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <Text variant="bodyLarge">Загрузка…</Text>
        ) : (
          <>
            <TextInput
              label="Название"
              value={name}
              onChangeText={setName}
              variant="outlined"
              error={Boolean(fieldError)}
            />
            <TextInput
              label="Описание"
              value={description}
              onChangeText={setDescription}
              variant="outlined"
              multiline
              numberOfLines={4}
            />
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Хочу посетить</Text>
              <Switch value={visitLater} onValueChange={setVisitLater} />
            </View>
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Понравилось</Text>
              <Switch value={liked} onValueChange={setLiked} />
            </View>
            <TextInput
              label="Координаты (широта, долгота)"
              value={coordinatesText}
              onChangeText={setCoordinatesText}
              variant="outlined"
              placeholder="55.744920, 37.604677"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {fieldError ? (
              <Text variant="bodySmall" style={styles.fieldError}>
                {fieldError}
              </Text>
            ) : null}
            <Button mode="filled" onPress={() => void save()} loading={saving} disabled={saving}>
              Сохранить
            </Button>
          </>
        )}
      </ScrollView>
      <Snackbar visible={error != null} onDismiss={() => setError(null)} duration={4000}>
        {error}
      </Snackbar>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: screenPadding,
    gap: 12,
    paddingBottom: 32,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldError: {
    color: '#B3261E',
  },
});