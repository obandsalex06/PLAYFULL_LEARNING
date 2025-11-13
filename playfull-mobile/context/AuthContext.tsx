import React, { createContext, useContext, useState, useEffect } from 'react';
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
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const login = async (userData: User, authTokens: AuthTokens) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('tokens', JSON.stringify(authTokens));
            setUser(userData);
            setTokens(authTokens);
        } catch (error) {
            console.error('Error saving auth:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['user', 'tokens']);
            setUser(null);
            setTokens(null);
        } catch (error) {
            console.error('Error clearing auth:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, tokens, isLoading, login, logout }}>
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
