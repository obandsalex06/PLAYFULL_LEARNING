import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthContextType {
    user: User | null;
    tokens: AuthTokens | null;
    isLoading: boolean;
    login: (userData: User, authTokens: AuthTokens) => Promise<void>;
    loginWithCredentials: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>; // convenience for screens
    logout: () => Promise<void>;
    refreshTokens: () => Promise<boolean>;
    authorizedFetch: (input: string, init?: RequestInit) => Promise<Response>; // auto refresh on 401
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshingRef = useRef<Promise<boolean> | null>(null); // prevent parallel refresh calls

    const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000';

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const [storedUser, storedTokens] = await Promise.all([
                AsyncStorage.getItem('user'),
                AsyncStorage.getItem('tokens'),
            ]);

            if (storedUser && storedTokens) {
                setUser(JSON.parse(storedUser));
                setTokens(JSON.parse(storedTokens));
            }
        } catch (error) {
            console.error('Error loading auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const persist = async (userData: User | null, authTokens: AuthTokens | null) => {
        if (userData && authTokens) {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('tokens', JSON.stringify(authTokens));
        } else {
            await AsyncStorage.multiRemove(['user', 'tokens']);
        }
    };

    const login = async (userData: User, authTokens: AuthTokens) => {
        try {
            await persist(userData, authTokens);
            setUser(userData);
            setTokens(authTokens);
        } catch (error) {
            console.error('Error saving auth:', error);
            throw error;
        }
    };

    const loginWithCredentials = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                return { ok: false, message: data.message || 'Credenciales inválidas' };
            }
            await login(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
            return { ok: true };
        } catch (e: any) {
            return { ok: false, message: e.message || 'Error de conexión' };
        }
    }, [API_BASE]);

    const refreshTokens = useCallback(async (): Promise<boolean> => {
        if (!tokens?.refreshToken) return false;
        // If a refresh is already in progress, reuse it
        if (refreshingRef.current) {
            return refreshingRef.current;
        }
        const refreshPromise = (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: tokens.refreshToken })
                });
                const data = await res.json();
                if (!res.ok) {
                    await logout();
                    return false;
                }
                // data: { accessToken, refreshToken, user }
                const newTokens: AuthTokens = { accessToken: data.accessToken, refreshToken: data.refreshToken || tokens.refreshToken };
                setTokens(newTokens);
                setUser(data.user || user); // keep previous if not provided
                await persist(data.user || user, newTokens);
                return true;
            } catch (e) {
                console.error('Refresh error', e);
                return false;
            } finally {
                refreshingRef.current = null;
            }
        })();
        refreshingRef.current = refreshPromise;
        return refreshPromise;
    }, [API_BASE, tokens, user]);

    const authorizedFetch = useCallback(async (input: string, init: RequestInit = {}) => {
        const accessToken = tokens?.accessToken;
        const headers: Record<string, string> = {
            ...(init.headers as Record<string, string> || {}),
        };
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        let res = await fetch(input, { ...init, headers });
        if (res.status === 401 && tokens?.refreshToken) {
            const refreshed = await refreshTokens();
            if (refreshed) {
                const retryHeaders: Record<string, string> = {
                    ...(init.headers as Record<string, string> || {}),
                    Authorization: `Bearer ${tokens?.accessToken}`
                };
                res = await fetch(input, { ...init, headers: retryHeaders });
            }
        }
        return res;
    }, [tokens, refreshTokens]);

    const logout = async () => {
        try {
            await persist(null, null);
            setUser(null);
            setTokens(null);
        } catch (error) {
            console.error('Error clearing auth:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, tokens, isLoading, login, loginWithCredentials, logout, refreshTokens, authorizedFetch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
