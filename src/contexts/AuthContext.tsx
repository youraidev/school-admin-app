import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getUser, setAuth, clearAuth, type AuthUser } from '../lib/auth';

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
    }, []);

    const logout = useCallback(() => {
        clearAuth();
        setUser(null);
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
