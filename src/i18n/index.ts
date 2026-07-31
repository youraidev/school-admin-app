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
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'language',
        },
    });

export default i18n;
