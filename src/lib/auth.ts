import type { AuthUser } from '../../shared/types/index.js';

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export type { AuthUser };

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
    const json = localStorage.getItem(USER_KEY);
    try {
        return json ? JSON.parse(json) : null;
    } catch {
        return null;
    }
}

export function setAuth(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
    return getToken() !== null;
}
