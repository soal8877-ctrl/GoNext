import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE } from '@/i18n/config';
import en from '@/i18n/locales/en';
import ru from '@/i18n/locales/ru';

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18n;

type TranslateOptions = Record<string, string | number>;

/** Перевод вне React-компонентов (утилиты, репозитории). */
export function translate(key: string, options?: TranslateOptions): string {
  if (options) {
    return i18n.t(key, options);
  }
  return i18n.t(key);
}