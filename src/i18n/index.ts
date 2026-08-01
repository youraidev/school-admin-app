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
            // localStorage first — respects a manual choice made on this PC.
            // navigator is the fallback for first-ever visits with no stored value.
            // On login, AuthContext calls i18n.changeLanguage() which overwrites
            // localStorage with the user's server-saved preference.
            // On logout, AuthContext clears the key so the next user starts fresh
            // from their browser locale.
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'language',
        },
    });

export default i18n;
