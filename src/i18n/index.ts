import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, defaultNS, SUPPORTED_LANGUAGES, type SupportedLanguage } from './resources';

/**
 * Language selection — single source of truth, in priority order:
 *
 *  1. Explicit choice on this device (user clicked the switcher) — never
 *     auto-overridden; pushed to the account on login / via PATCH /api/auth/language.
 *  2. Signed-in user's stored preference — returned by login/register responses
 *     and applied by AuthContext (covers logging in on a new device).
 *  3. First visit only: visitor country from GET /api/geo (edge header on the
 *     hosting platform) — a positive signal that can switch TO that country's
 *     language (LT → Lithuanian); it never forces English on, say, a Lithuanian
 *     browser abroad.
 *  4. Browser language (navigator).
 *  5. Fallback: English.
 */

const LANGUAGE_KEY = 'language';
const EXPLICIT_KEY = 'language-explicit';

export function hasExplicitLanguageChoice(): boolean {
    return localStorage.getItem(EXPLICIT_KEY) === '1';
}

/** Call only when the USER picks a language — not when code changes it automatically. */
export function markLanguageExplicit(): void {
    localStorage.setItem(EXPLICIT_KEY, '1');
}

/** On sign-out: the next visitor on this device starts fresh from geo/browser detection. */
export function resetLanguageToDeviceDefault(): void {
    localStorage.removeItem(LANGUAGE_KEY);
    localStorage.removeItem(EXPLICIT_KEY);
    i18n.changeLanguage(navigator.language);
}

// Countries whose visitors get a non-English default. Extend when adding languages.
const GEO_LANGUAGE: Partial<Record<string, SupportedLanguage>> = { LT: 'lt' };

// Must be read BEFORE init — the detector caches its result to localStorage immediately
const isFirstVisit = !localStorage.getItem(LANGUAGE_KEY);

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
            lookupLocalStorage: LANGUAGE_KEY,
        },
    });

// Priority 3: refine the first-visit browser guess with the visitor's country.
// Locally /api/geo returns null (no edge headers), so browser detection stands.
if (isFirstVisit) {
    fetch('/api/geo')
        .then(res => (res.ok ? res.json() : null))
        .then((data: { country?: string | null } | null) => {
            const lang = data?.country ? GEO_LANGUAGE[data.country] : undefined;
            if (lang && lang !== i18n.resolvedLanguage && !hasExplicitLanguageChoice()) {
                i18n.changeLanguage(lang);
            }
        })
        .catch(() => { /* offline or blocked — browser detection already applied */ });
}

export default i18n;
