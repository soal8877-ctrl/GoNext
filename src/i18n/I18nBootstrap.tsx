import '@/i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { isAppLanguage, LANGUAGE_STORAGE_KEY } from '@/i18n/config';

type I18nBootstrapProps = {
  children: ReactNode;
};

export function I18nBootstrap({ children }: I18nBootstrapProps) {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && isAppLanguage(stored) && stored !== i18n.language) {
          await i18n.changeLanguage(stored);
        }
      } catch {
        // оставляем язык по умолчанию
      } finally {
        setReady(true);
      }
    })();
  }, [i18n]);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});