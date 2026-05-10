import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser, registerSchool } from '../lib/api';

type Mode = 'login' | 'register';

export default function LoginPage() {
    const { login }       = useAuth();
    const navigate        = useNavigate();
    const [searchParams]  = useSearchParams();
    const resetSuccess    = searchParams.get('reset') === '1';
    const [mode, setMode] = useState<Mode>('login');
    const [schoolName, setSchoolName] = useState('');
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = mode === 'login'
                ? await loginUser(email, password)
                : await registerSchool(schoolName, email, password);
            login(data.token, data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-1">
                    {mode === 'login' ? 'Sign in' : 'Create account'}
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    {mode === 'login' ? 'Welcome back' : 'Set up your school on SchoolAdmin'}
                </p>

                {resetSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-3 mb-4">
                        Password reset successfully. You can now sign in.
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">School name</label>
                            <input
                                type="text"
                                value={schoolName}
                                onChange={e => setSchoolName(e.target.value)}
                                required
                                placeholder="Lincoln High School"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="admin@school.edu"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium">Password</label>
                            {mode === 'login' && (
                                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                                    Forgot password?
                                </Link>
                            )}
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={mode === 'register' ? 8 : undefined}
                            placeholder={mode === 'register' ? 'At least 8 characters' : ''}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign in' : 'Create account')}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-500 mt-6">
                    {mode === 'login' ? (
                        <>Don't have an account?{' '}
                            <button onClick={() => { setMode('register'); setError(''); }} className="text-blue-600 hover:underline font-medium">
                                Register your school
                            </button>
                        </>
                    ) : (
                        <>Already have an account?{' '}
                            <button onClick={() => { setMode('login'); setError(''); }} className="text-blue-600 hover:underline font-medium">
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
