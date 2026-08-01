import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getUser, setAuth, clearAuth, type AuthUser } from '../lib/auth';
import i18n, { resetLanguageToDeviceDefault } from '../i18n';

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
        // Adopt the account's saved language (priority 2 — see src/i18n/index.ts).
        // The server already resolved explicit device choices, so this is safe to apply.
        if (authUser.preferredLanguage) {
            i18n.changeLanguage(authUser.preferredLanguage);
        }
    }, []);

    const logout = useCallback(() => {
        clearAuth();
        setUser(null);
        // Next user on this device starts fresh from geo/browser detection
        resetLanguageToDeviceDefault();
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
