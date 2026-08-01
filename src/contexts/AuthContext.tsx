import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getUser, setAuth, clearAuth, type AuthUser } from '../lib/auth';
import i18n from '../i18n';

interface AuthContextValue {
    user: AuthUser | null;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(getUser);

    const login = useCallback((token: string, authUser: AuthUser) => {
        setAuth(token, authUser);
        setUser(authUser);
        // Apply the user's saved language preference immediately, overriding
        // any stale localStorage value from a previous session or a different user.
        if (authUser.preferredLanguage) {
            i18n.changeLanguage(authUser.preferredLanguage);
        }
    }, []);

    const logout = useCallback(() => {
        clearAuth();
        setUser(null);
        // Clear the stored language so the next user on this PC starts from
        // their browser locale rather than the previous user's preference.
        localStorage.removeItem('language');
        i18n.changeLanguage(navigator.language);
    }, []);

    // Handle 401 responses dispatched by the API layer — clears state so
    // RequireAuth picks up the null user and navigates to /login via React Router
    useEffect(() => {
        window.addEventListener('auth:unauthorized', logout);
        return () => window.removeEventListener('auth:unauthorized', logout);
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
