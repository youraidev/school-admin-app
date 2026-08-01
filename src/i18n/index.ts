import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, defaultNS, SUPPORTED_LANGUAGES } from './resources';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        defaultNS,
        fallbackLng: 'en',
        supportedLngs: [...SUPPORTED_LANGUAGES],
        nonExplicitSupportedLngs: true, // "lt-LT" in the browser resolves to "lt"
        interpolation: { escapeValue: false }, // React already escapes
        detection: {
            // navigator first so the browser locale wins on the first ever visit.
            // localStorage then takes over once the user has made an explicit choice
            // (or logged in, which writes their saved preference via i18n.changeLanguage).
            order: ['navigator', 'localStorage'],
            caches: ['localStorage'],
            lookupLocalStorage: 'language',
        },
    });

export default i18n;
