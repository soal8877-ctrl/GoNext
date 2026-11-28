import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, SegmentedButtons, Text } from 'react-native-paper';
import Constants from 'expo-constants';
import { useSQLiteContext } from 'expo-sqlite';

import { ScreenShell } from '@/components/ScreenShell';
import { ScreenLoading } from '@/components/ScreenStatus';
import { screenPadding } from '@/constants/screen';
import { listPlaces, listTrips } from '@/repositories';
import { useThemePreference } from '@/theme/ThemePreferenceContext';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const sdkVersion = Constants.expoConfig?.sdkVersion ?? '—';
  const db = useSQLiteContext();
  const { mode, setMode } = useThemePreference();
  const [counts, setCounts] = useState<{ places: number; trips: number } | null>(null);

  useEffect(() => {
    void (async () => {
      const [places, trips] = await Promise.all([listPlaces(db), listTrips(db)]);
      setCounts({ places: places.length, trips: trips.length });
    })();
  }, [db]);

  return (
    <ScreenShell title="Настройки" showBack>
      {counts === null ? (
        <ScreenLoading />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text variant="bodyMedium" style={styles.lead}>
            GoNext — дневник туриста. Все режимы из главного меню доступны без регистрации.
          </Text>
          <List.Section>
            <List.Subheader>Оформление</List.Subheader>
            <View style={styles.themeRow}>
              <SegmentedButtons
                value={mode}
                onValueChange={(value) => {
                  if (value === 'light' || value === 'dark') {
                    setMode(value);
                  }
                }}
                buttons={[
                  { value: 'light', label: 'Светлая', icon: 'white-balance-sunny' },
                  { value: 'dark', label: 'Тёмная', icon: 'weather-night' },
                ]}
              />
            </View>
            <List.Item
              title="Фон экранов"
              description={
                mode === 'light'
                  ? 'В светлой теме показывается декоративное изображение.'
                  : 'В тёмной теме фоновое изображение отключено.'
              }
              left={(props) => <List.Icon {...props} icon="image-outline" />}
            />
            <Divider />
          </List.Section>
          <List.Section>
            <List.Subheader>Данные на устройстве</List.Subheader>
            <List.Item
              title="Локальное хранение"
              description="Места, поездки и фото не отправляются на сервер. Резервное копирование в MVP не предусмотрено."
              left={(props) => <List.Icon {...props} icon="database" />}
            />
            <Divider />
            <List.Item
              title="Справочник и поездки"
              description={`Мест: ${counts.places}, поездок: ${counts.trips}.`}
              left={(props) => <List.Icon {...props} icon="counter" />}
            />
          </List.Section>
          <List.Section>
            <List.Subheader>Офлайн и карты</List.Subheader>
            <List.Item
              title="Авиарежим"
              description="Списки, поездки, «Выражения» и фото на устройстве работают без интернета."
              left={(props) => <List.Icon {...props} icon="airplane" />}
            />
            <Divider />
            <List.Item
              title="Карта и навигатор"
              description="Открывают внешние приложения; для маршрута может понадобиться сеть."
              left={(props) => <List.Icon {...props} icon="map" />}
            />
          </List.Section>
          <List.Section>
            <List.Subheader>О приложении</List.Subheader>
            <List.Item
              title={`Версия ${version}`}
              description={`Expo SDK ${sdkVersion}`}
              left={(props) => <List.Icon {...props} icon="information" />}
            />
          </List.Section>
          <View style={styles.footer}>
            <Text variant="labelMedium" style={styles.footerText}>
              Сброс базы в MVP не предусмотрен. Для полной очистки — удалите данные Expo Go для
              этого проекта или переустановите dev-сборку.
            </Text>
          </View>
        </ScrollView>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  lead: {
    paddingHorizontal: screenPadding,
    paddingTop: 8,
    paddingBottom: 4,
    opacity: 0.9,
  },
  themeRow: {
    paddingHorizontal: screenPadding,
    paddingBottom: 8,
  },
  footer: {
    paddingHorizontal: screenPadding,
    paddingTop: 8,
  },
  footerText: {
    opacity: 0.7,
    lineHeight: 20,
  },
});