import { useTranslation } from 'react-i18next';
import { ApiError } from '../lib/api';

/**
 * Extracts a stable error code from anything thrown by the API layer.
 * Components store this code in state and translate it at render time,
 * so the message follows the active language.
 */
export function getErrorCode(err: unknown): string {
    if (err instanceof ApiError) return err.code;
    return 'UNKNOWN';
}

/** Returns a translator: error code (or thrown error) → localized message. */
export function useErrorMessage(): (codeOrError: unknown) => string {
    const { t } = useTranslation('errors');
    // Codes arrive at runtime from the server, so bypass the strictly-typed overload once here
    const tr = t as unknown as (key: string, options?: Record<string, unknown>) => string;

    return (codeOrError: unknown): string => {
        if (codeOrError == null || codeOrError === '') return '';
        const code = typeof codeOrError === 'string' ? codeOrError : getErrorCode(codeOrError);
        return tr(code, { defaultValue: tr('UNKNOWN') });
    };
}
