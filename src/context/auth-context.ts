// src/context/auth-context.ts
import { createContext, useContext } from 'react';

export interface AuthContextType {
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}