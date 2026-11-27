import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Constants from 'expo-constants';
import { useSQLiteContext } from 'expo-sqlite';

import { ScreenShell } from '@/components/ScreenShell';
import { screenStyles } from '@/constants/screen';
import { listPlaces, listTrips } from '@/repositories';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const sdkVersion = Constants.expoConfig?.sdkVersion ?? '—';
  const db = useSQLiteContext();
  const [counts, setCounts] = useState<{ places: number; trips: number } | null>(null);

  useEffect(() => {
    void (async () => {
      const [places, trips] = await Promise.all([listPlaces(db), listTrips(db)]);
      setCounts({ places: places.length, trips: trips.length });
    })();
  }, [db]);

  return (
    <ScreenShell title="Настройки" showBack>
      <View style={screenStyles.body}>
        <Text variant="bodyLarge">
          GoNext — дневник туриста.{'\n\n'}
          Все данные (места, поездки, фото) хранятся только на этом устройстве. Регистрация и
          облако не используются.{'\n\n'}
          Списки, поездки и «Выражения» работают в авиарежиме. Карта и навигатор открывают
          внешние приложения и могут потребовать сеть.{'\n\n'}
          Версия приложения: {version}
          {'\n'}
          Expo SDK: {sdkVersion}
          {'\n\n'}
          {counts
            ? `В базе: мест — ${counts.places}, поездок — ${counts.trips}.`
            : 'Подключение к базе данных…'}
        </Text>
      </View>
    </ScreenShell>
  );
}