import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../lib/api';
import { getErrorCode, useErrorMessage } from '../i18n/errors';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';

export default function ResetPasswordPage() {
    const { t }                 = useTranslation('auth');
    const errorMessage          = useErrorMessage();
    const [searchParams]        = useSearchParams();
    const navigate              = useNavigate();
    const token                 = searchParams.get('token') ?? '';
    const [password, setPassword]   = useState('');
    const [confirm, setConfirm]     = useState('');
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        if (password !== confirm) {
            setError('PASSWORDS_DO_NOT_MATCH');
            return;
        }
        if (password.length < 8) {
            setError('PASSWORD_TOO_SHORT');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(token, password);
            navigate('/login?reset=1');
        } catch (err) {
            setError(getErrorCode(err));
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <LanguageSwitcher variant="floating" />
                <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm text-center">
                    <p className="text-sm text-gray-600 mb-4">{t('reset.invalidLink')}</p>
                    <Link to="/forgot-password" className="text-primary hover:underline text-sm font-medium">
                        {t('reset.requestNew')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <LanguageSwitcher variant="floating" />
            <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-1">{t('reset.title')}</h1>
                <p className="text-sm text-gray-500 mb-6">{t('reset.subtitle')}</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                        {errorMessage(error)}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('reset.newPassword')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder={t('passwordMinPlaceholder')}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('reset.confirmPassword')}</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                            placeholder={t('reset.repeatPlaceholder')}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {loading ? t('reset.saving') : t('reset.submit')}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-500 mt-6">
                    <Link to="/login" className="text-primary hover:underline font-medium">
                        {t('forgot.backToSignIn')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
