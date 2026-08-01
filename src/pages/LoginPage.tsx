import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../lib/api';
import { getErrorCode, useErrorMessage } from '../i18n/errors';
import { hasExplicitLanguageChoice } from '../i18n';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';

type Mode = 'login' | 'register';

// New schools are onboarded manually — the register view shows this contact
// instead of a form (the API endpoint is disabled too, see server/routes/auth.ts)
const ONBOARDING_EMAIL = 'arturas@aicoding.lt';

export default function LoginPage() {
    const { t, i18n }     = useTranslation('auth');
    const errorMessage    = useErrorMessage();
    const { login }       = useAuth();
    const navigate        = useNavigate();
    const [searchParams]  = useSearchParams();
    const resetSuccess    = searchParams.get('reset') === '1';
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError]           = useState('');
    const [loading, setLoading]       = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Only an explicit device choice may overwrite the account's stored
            // preference; otherwise the server's value wins (applied in AuthContext).
            const data = await loginUser(email, password, hasExplicitLanguageChoice() ? i18n.resolvedLanguage : undefined);
            login(data.token, data.user);
            navigate('/');
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
                <img
                    src="/logo-mark.svg"
                    alt=""
                    aria-hidden="true"
                    className="w-14 h-14 object-contain mb-4"
                />
                <h1 className="text-2xl font-bold mb-1">
                    {mode === 'login' ? t('signIn') : t('createAccount')}
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    {mode === 'login' ? t('welcomeBack') : t('setupSchool')}
                </p>

                {mode === 'register' ? (
                    /* Manual onboarding notice — no self-service registration */
                    <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-4 text-sm text-gray-700">
                        <p className="mb-3 leading-relaxed">{t('registerManualInfo')}</p>
                        <a
                            href={`mailto:${ONBOARDING_EMAIL}`}
                            className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                        >
                            <Mail size={16} />
                            {ONBOARDING_EMAIL}
                        </a>
                    </div>
                ) : (
                    <>
                        {resetSuccess && (
                            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-3 mb-4">
                                {t('resetSuccess')}
                            </div>
                        )}

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
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium">{t('password')}</label>
                                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                                        {t('forgotPasswordLink')}
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                {loading ? t('signingIn') : t('signIn')}
                            </button>
                        </form>
                    </>
                )}

                <p className="text-sm text-center text-gray-500 mt-6">
                    {mode === 'login' ? (
                        <>{t('noAccount')}{' '}
                            <button onClick={() => { setMode('register'); setError(''); setShowPassword(false); }} className="text-primary hover:underline font-medium">
                                {t('registerSchool')}
                            </button>
                        </>
                    ) : (
                        <>{t('haveAccount')}{' '}
                            <button onClick={() => { setMode('login'); setError(''); setShowPassword(false); }} className="text-primary hover:underline font-medium">
                                {t('signIn')}
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
