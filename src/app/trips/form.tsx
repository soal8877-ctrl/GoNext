import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Switch, Text, TextInput } from 'react-native-paper';
import { type Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ScreenShell } from '@/components/ScreenShell';
import { screenPadding } from '@/constants/screen';
import { createTrip, deleteTrip, getTripById, updateTrip } from '@/repositories/trips';
import { formatDateDisplay, parseOptionalIsoDate } from '@/utils/dates';

export default function TripFormScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const tripId = id ? Number(id) : null;
  const isEdit = tripId != null && Number.isFinite(tripId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDateText, setStartDateText] = useState('');
  const [endDateText, setEndDateText] = useState('');
  const [current, setCurrent] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTrip = useCallback(async () => {
    if (!isEdit || tripId == null) {
      return;
    }
    setLoading(true);
    const trip = await getTripById(db, tripId);
    if (!trip) {
      setError('Поездка не найдена.');
      setLoading(false);
      return;
    }
    setTitle(trip.title);
    setDescription(trip.description);
    setStartDateText(trip.startDate ? formatDateDisplay(trip.startDate) : '');
    setEndDateText(trip.endDate ? formatDateDisplay(trip.endDate) : '');
    setCurrent(trip.current);
    setLoading(false);
  }, [db, isEdit, tripId]);

  useFocusEffect(
    useCallback(() => {
      void loadTrip();
    }, [loadTrip])
  );

  const save = async () => {
    setFieldError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFieldError('Введите название поездки.');
      return;
    }

    const start = parseOptionalIsoDate(startDateText);
    if (!start.ok) {
      setFieldError(start.message);
      return;
    }
    const end = parseOptionalIsoDate(endDateText);
    if (!end.ok) {
      setFieldError(end.message);
      return;
    }
    if (start.value && end.value && start.value > end.value) {
      setFieldError('Дата начала не может быть позже даты окончания.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: description.trim(),
        startDate: start.value,
        endDate: end.value,
        current,
      };

      if (isEdit && tripId != null) {
        const updated = await updateTrip(db, tripId, payload);
        if (!updated) {
          setError('Не удалось сохранить изменения.');
          return;
        }
        router.replace(`/trips/${tripId}` as Href);
      } else {
        const created = await createTrip(db, payload);
        router.replace(`/trips/${created.id}` as Href);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (tripId == null) {
      return;
    }
    setDeleting(true);
    try {
      const ok = await deleteTrip(db, tripId);
      if (!ok) {
        setError('Не удалось удалить поездку.');
        return;
      }
      setDeleteVisible(false);
      router.replace('/trips' as Href);
    } catch {
      setError('Не удалось удалить поездку.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScreenShell title={isEdit ? 'Редактировать поездку' : 'Новая поездка'} showBack>
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <Text variant="bodyLarge">Загрузка…</Text>
        ) : (
          <>
            <TextInput
              label="Название"
              value={title}
              onChangeText={setTitle}
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
            <TextInput
              label="Дата начала"
              value={startDateText}
              onChangeText={setStartDateText}
              variant="outlined"
              placeholder="ДД.ММ.ГГГГ"
            />
            <TextInput
              label="Дата окончания"
              value={endDateText}
              onChangeText={setEndDateText}
              variant="outlined"
              placeholder="ДД.ММ.ГГГГ"
            />
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Текущая поездка</Text>
              <Switch value={current} onValueChange={setCurrent} />
            </View>
            {fieldError ? (
              <Text variant="bodySmall" style={styles.fieldError}>
                {fieldError}
              </Text>
            ) : null}
            <Button mode="filled" onPress={() => void save()} loading={saving} disabled={saving}>
              Сохранить
            </Button>
            {isEdit ? (
              <Button mode="text" textColor="#B3261E" onPress={() => setDeleteVisible(true)}>
                Удалить поездку
              </Button>
            ) : null}
          </>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>Удалить поездку?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Маршрут и заметки будут удалены без возможности восстановления.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)}>Отмена</Button>
            <Button loading={deleting} disabled={deleting} onPress={() => void onDelete()}>
              Удалить
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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