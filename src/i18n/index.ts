/**
 * i18n setup (i18next + react-i18next). Initial language follows the device
 * (expo-localization); once the profile loads we sync to the user's saved
 * `locale` via setAppLanguage(). TH/EN only.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en';
import th from './locales/th';

export type AppLanguage = 'en' | 'th';

function deviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode;
  return code === 'th' ? 'th' : 'en';
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      th: { translation: th },
    },
    lng: deviceLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export function setAppLanguage(lang: AppLanguage): void {
  if (i18n.language !== lang) i18n.changeLanguage(lang);
}

export default i18n;
