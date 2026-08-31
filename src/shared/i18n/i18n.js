/**
 * i18n configuration for Gritmode — Vietnamese & English only
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viTranslation from './locales/vi.json';
import enTranslation from './locales/en.json';

const resources = {
  vi: { translation: viTranslation },
  en: { translation: enTranslation },
};

const getStoredLang = () => {
  try {
    const stored = localStorage.getItem('gritmode_lang');
    if (['vi', 'en'].includes(stored)) return stored;
  } catch (e) {
    // ignore
  }
  return null;
};

const getBrowserLang = () => {
  try {
    const browser = navigator.language?.split('-')[0];
    if (browser === 'vi') return 'vi';
  } catch (e) {
    // ignore
  }
  return 'vi';
};

const initialLang = getStoredLang() || getBrowserLang();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
