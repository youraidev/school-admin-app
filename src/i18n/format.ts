import { format as formatDateFns } from 'date-fns';
import type { Locale } from 'date-fns';
import { lt } from 'date-fns/locale';
import i18n from './index';

// English is date-fns' built-in default, so only non-default locales are listed
const LOCALES: Record<string, Locale> = { lt };

/** Locale-aware date formatting. Use instead of calling date-fns format() directly. */
export function formatDate(date: string | Date, pattern: string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDateFns(d, pattern, { locale: LOCALES[i18n.language] });
}

/** "5 yrs, 3 mos" / "5 m. 3 mėn." — length of employment since startDate. */
export function formatTenure(startDate: string): string {
    const start = new Date(startDate);
    const now = new Date();
    let totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) totalMonths--;

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const y = i18n.t('common:tenure.years', { count: years });
    const m = i18n.t('common:tenure.months', { count: months });

    if (years === 0) return m;
    if (months === 0) return y;
    return `${y}, ${m}`;
}
