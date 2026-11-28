import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, SegmentedButtons, Text } from 'react-native-paper';
import Constants from 'expo-constants';
import { useSQLiteContext } from 'expo-sqlite';
import { useTranslation } from 'react-i18next';

import { ScreenShell } from '@/components/ScreenShell';
import { ThemePrimaryColorPicker } from '@/components/ThemePrimaryColorPicker';
import { ScreenLoading } from '@/components/ScreenStatus';
import { screenPadding } from '@/constants/screen';
import { useAppLanguage } from '@/i18n/useAppLanguage';
import { listPlaces, listTrips } from '@/repositories';
import { useThemePreference } from '@/theme/ThemePreferenceContext';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const sdkVersion = Constants.expoConfig?.sdkVersion ?? '—';
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const { language, setLanguage } = useAppLanguage();
  const { mode, setMode, primaryColorId, setPrimaryColorId } = useThemePreference();
  const [counts, setCounts] = useState<{ places: number; trips: number } | null>(null);

  useEffect(() => {
    void (async () => {
      const [places, trips] = await Promise.all([listPlaces(db), listTrips(db)]);
      setCounts({ places: places.length, trips: trips.length });
    })();
  }, [db]);

  return (
    <ScreenShell title={t('settings.title')} showBack>
      {counts === null ? (
        <ScreenLoading />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text variant="bodyMedium" style={styles.lead}>
            {t('settings.lead')}
          </Text>
          <List.Section>
            <List.Subheader>{t('settings.appearance')}</List.Subheader>
            <View style={styles.themeRow}>
              <Text variant="labelLarge" style={styles.rowLabel}>
                {t('settings.language')}
              </Text>
              <SegmentedButtons
                value={language}
                onValueChange={(value) => {
                  if (value === 'ru' || value === 'en') {
                    void setLanguage(value);
                  }
                }}
                buttons={[
                  { value: 'ru', label: t('settings.langRu') },
                  { value: 'en', label: t('settings.langEn') },
                ]}
              />
            </View>
            <View style={styles.themeRow}>
              <SegmentedButtons
                value={mode}
                onValueChange={(value) => {
                  if (value === 'light' || value === 'dark') {
                    setMode(value);
                  }
                }}
                buttons={[
                  { value: 'light', label: t('settings.themeLight'), icon: 'white-balance-sunny' },
                  { value: 'dark', label: t('settings.themeDark'), icon: 'weather-night' },
                ]}
              />
            </View>
            <ThemePrimaryColorPicker value={primaryColorId} onChange={setPrimaryColorId} />
            <List.Item
              title={t('settings.backgroundTitle')}
              description={
                mode === 'light' ? t('settings.backgroundLight') : t('settings.backgroundDark')
              }
              left={(props) => <List.Icon {...props} icon="image-outline" />}
            />
            <Divider />
          </List.Section>
          <List.Section>
            <List.Subheader>{t('settings.dataOnDevice')}</List.Subheader>
            <List.Item
              title={t('settings.localStorageTitle')}
              description={t('settings.localStorageDesc')}
              left={(props) => <List.Icon {...props} icon="database" />}
            />
            <Divider />
            <List.Item
              title={t('settings.countsTitle')}
              description={t('settings.countsDesc', {
                places: counts.places,
                trips: counts.trips,
              })}
              left={(props) => <List.Icon {...props} icon="counter" />}
            />
          </List.Section>
          <List.Section>
            <List.Subheader>{t('settings.offlineMaps')}</List.Subheader>
            <List.Item
              title={t('settings.offlineTitle')}
              description={t('settings.offlineDesc')}
              left={(props) => <List.Icon {...props} icon="airplane" />}
            />
            <Divider />
            <List.Item
              title={t('settings.mapsTitle')}
              description={t('settings.mapsDesc')}
              left={(props) => <List.Icon {...props} icon="map" />}
            />
          </List.Section>
          <List.Section>
            <List.Subheader>{t('settings.about')}</List.Subheader>
            <List.Item
              title={t('settings.version', { version })}
              description={t('settings.sdk', { version: sdkVersion })}
              left={(props) => <List.Icon {...props} icon="information" />}
            />
          </List.Section>
          <View style={styles.footer}>
            <Text variant="labelMedium" style={styles.footerText}>
              {t('settings.footerReset')}
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
    gap: 8,
  },
  rowLabel: {
    opacity: 0.85,
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