import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import bho from './locales/bho.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en:  { translation: en  },
      hi:  { translation: hi  },
      bho: { translation: bho },
    },
    fallbackLng: 'hi',
    supportedLngs: ['en', 'hi', 'bho'],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnEmptyString: false,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'shramsetu_lang',
      caches: ['localStorage'],
    },
  });

// Keep <html lang> in sync for a11y + SEO
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;