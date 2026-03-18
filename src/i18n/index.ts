import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';
import he from './locales/he.json';

const RTL_LANGUAGES = ['ar', 'he'];

function applyDirection(lng: string) {
  const dir = RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      he: { translation: he },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'homehub_language',
      caches: ['localStorage'],
    },
  });

// Apply direction on init and language change
applyDirection(i18n.language || 'en');
i18n.on('languageChanged', applyDirection);

export default i18n;
