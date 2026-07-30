import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { cn } from '../../lib/utils';
import { updatePreferredLanguage } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n/resources';

interface LanguageSwitcherProps {
    /** 'sidebar' renders as a nav row; 'floating' as a pill fixed to the top-right (auth pages). */
    variant?: 'sidebar' | 'floating';
}

export default function LanguageSwitcher({ variant = 'sidebar' }: LanguageSwitcherProps) {
    const { t, i18n } = useTranslation();
    const current = (i18n.resolvedLanguage ?? 'en') as SupportedLanguage;

    function changeLanguage(lng: SupportedLanguage) {
        if (lng === current) return;
        i18n.changeLanguage(lng);
        // Persist for server-sent emails; best-effort, only when signed in
        if (getToken()) updatePreferredLanguage(lng).catch(() => {});
    }

    const buttons = SUPPORTED_LANGUAGES.map(lng => (
        <button
            key={lng}
            onClick={() => changeLanguage(lng)}
            aria-pressed={current === lng}
            aria-label={t(`language.${lng}`)}
            className={cn(
                'px-2 py-0.5 rounded-md text-xs font-semibold uppercase transition-colors',
                variant === 'sidebar'
                    ? current === lng
                        ? 'bg-sidebar-primary text-white'
                        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
                    : current === lng
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:text-gray-800'
            )}
        >
            {lng}
        </button>
    ));

    if (variant === 'floating') {
        return (
            <div className="fixed top-4 right-4 flex items-center gap-1 bg-white border rounded-lg shadow-sm px-2 py-1.5">
                <Languages className="w-4 h-4 text-gray-400 mr-1" />
                {buttons}
            </div>
        );
    }

    return (
        <div className="nav-link w-full cursor-default">
            <Languages className="w-5 h-5" />
            <span>{t('language.label')}</span>
            <span className="ml-auto flex items-center gap-1">{buttons}</span>
        </div>
    );
}
