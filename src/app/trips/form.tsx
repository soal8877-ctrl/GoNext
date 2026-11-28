import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Switch, Text, TextInput } from 'react-native-paper';
import { type Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTranslation } from 'react-i18next';

import { ScreenShell } from '@/components/ScreenShell';
import { ScreenLoading } from '@/components/ScreenStatus';
import { screenPadding } from '@/constants/screen';
import { createTrip, deleteTrip, getTripById, updateTrip } from '@/repositories/trips';
import { formatDateDisplay, parseOptionalIsoDate } from '@/utils/dates';

export default function TripFormScreen() {
  const db = useSQLiteContext();
  const { t } = useTranslation();
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
      setError(t('trips.notFoundLoad'));
      setLoading(false);
      return;
    }
    setTitle(trip.title);
    setDescription(trip.description);
    setStartDateText(trip.startDate ? formatDateDisplay(trip.startDate) : '');
    setEndDateText(trip.endDate ? formatDateDisplay(trip.endDate) : '');
    setCurrent(trip.current);
    setLoading(false);
  }, [db, isEdit, tripId, t]);

  useFocusEffect(
    useCallback(() => {
      void loadTrip();
    }, [loadTrip])
  );

  const save = async () => {
    setFieldError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFieldError(t('trips.titleRequired'));
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
      setFieldError(t('trips.dateRangeInvalid'));
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
          setError(t('common.saveFailed'));
          return;
        }
        router.replace(`/trips/${tripId}` as Href);
      } else {
        const created = await createTrip(db, payload);
        router.replace(`/trips/${created.id}` as Href);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.saveError'));
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
        setError(t('trips.deleteFailed'));
        return;
      }
      setDeleteVisible(false);
      router.replace('/trips' as Href);
    } catch {
      setError(t('trips.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScreenShell title={isEdit ? t('trips.formEdit') : t('trips.formNew')} showBack>
      {loading ? (
        <ScreenLoading />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <>
            <TextInput
              label={t('trips.fieldTitle')}
              value={title}
              onChangeText={setTitle}
              variant="outlined"
              error={Boolean(fieldError)}
            />
            <TextInput
              label={t('trips.fieldDescription')}
              value={description}
              onChangeText={setDescription}
              variant="outlined"
              multiline
              numberOfLines={4}
            />
            <TextInput
              label={t('trips.fieldStartDate')}
              value={startDateText}
              onChangeText={setStartDateText}
              variant="outlined"
              placeholder={t('trips.datePlaceholder')}
            />
            <TextInput
              label={t('trips.fieldEndDate')}
              value={endDateText}
              onChangeText={setEndDateText}
              variant="outlined"
              placeholder={t('trips.datePlaceholder')}
            />
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">{t('trips.currentTripSwitch')}</Text>
              <Switch value={current} onValueChange={setCurrent} />
            </View>
            {fieldError ? (
              <Text variant="bodySmall" style={styles.fieldError}>
                {fieldError}
              </Text>
            ) : null}
            <Button mode="filled" onPress={() => void save()} loading={saving} disabled={saving}>
              {t('common.save')}
            </Button>
            {isEdit ? (
              <Button mode="text" textColor="#B3261E" onPress={() => setDeleteVisible(true)}>
                {t('trips.deleteTrip')}
              </Button>
            ) : null}
          </>
        </ScrollView>
      )}

      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>{t('trips.deleteConfirmTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('trips.deleteConfirmBody')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)}>{t('common.cancel')}</Button>
            <Button loading={deleting} disabled={deleting} onPress={() => void onDelete()}>
              {t('common.delete')}
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