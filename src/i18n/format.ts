import { format as formatDateFns, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import { lt } from 'date-fns/locale';
import i18n from './index';

// English is date-fns' built-in default, so only non-default locales are listed
const LOCALES: Record<string, Locale> = { lt };

// parseISO treats date-only strings ("2026-05-01") as local time, unlike new Date(),
// which parses them as UTC midnight and shifts a day back in negative-offset timezones.
function toDate(date: string | Date): Date {
    return typeof date === 'string' ? parseISO(date) : date;
}

/** Locale-aware date formatting. Use instead of calling date-fns format() directly. */
export function formatDate(date: string | Date, pattern: string): string {
    return formatDateFns(toDate(date), pattern, { locale: LOCALES[i18n.language] });
}

/** "5 yrs, 3 mos" / "5 m. 3 mėn." — length of employment since startDate. */
export function formatTenure(startDate: string): string {
    const start = toDate(startDate);
    const now = new Date();
    let totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) totalMonths--;
    if (totalMonths < 0) totalMonths = 0; // future start dates count as no tenure yet

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const y = i18n.t('common:tenure.years', { count: years });
    const m = i18n.t('common:tenure.months', { count: months });

    if (years === 0) return m;
    if (months === 0) return y;
    return `${y}, ${m}`;
}
