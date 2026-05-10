import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../lib/api';

export default function ResetPasswordPage() {
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
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(token, password);
            navigate('/login?reset=1');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm text-center">
                    <p className="text-sm text-gray-600 mb-4">Invalid reset link.</p>
                    <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm font-medium">
                        Request a new one
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-1">Set new password</h1>
                <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">New password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="At least 8 characters"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Confirm new password</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                            placeholder="Repeat password"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Saving…' : 'Reset password'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-500 mt-6">
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
