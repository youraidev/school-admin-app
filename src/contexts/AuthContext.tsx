import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
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
