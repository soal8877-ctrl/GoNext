import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { isAppLanguage, LANGUAGE_STORAGE_KEY, type AppLanguage } from '@/i18n/config';

export function useAppLanguage() {
  const { i18n } = useTranslation();

  const language: AppLanguage = isAppLanguage(i18n.language) ? i18n.language : 'ru';

  const setLanguage = useCallback(
    async (lng: AppLanguage) => {
      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    },
    [i18n]
  );

  return { language, setLanguage };
}