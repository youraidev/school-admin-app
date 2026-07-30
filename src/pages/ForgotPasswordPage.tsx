import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../lib/api';
import { getErrorCode, useErrorMessage } from '../i18n/errors';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';

export default function ForgotPasswordPage() {
    const { t, i18n } = useTranslation('auth');
    const errorMessage = useErrorMessage();
    const [email, setEmail]     = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await forgotPassword(email, i18n.resolvedLanguage);
            setSubmitted(true);
        } catch (err) {
            setError(getErrorCode(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <LanguageSwitcher variant="floating" />
            <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-1">{t('forgot.title')}</h1>
                <p className="text-sm text-gray-500 mb-6">
                    {t('forgot.subtitle')}
                </p>

                {submitted ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-4">
                        {t('forgot.submitted')}
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                                {errorMessage(error)}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('email')}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder={t('emailPlaceholder')}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? t('forgot.sending') : t('forgot.sendLink')}
                            </button>
                        </form>
                    </>
                )}

                <p className="text-sm text-center text-gray-500 mt-6">
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        {t('forgot.backToSignIn')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
