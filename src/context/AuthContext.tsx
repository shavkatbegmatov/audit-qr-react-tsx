import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { validateToken } from '../services/tokenService';

// Define token keys as constants
const TOKEN_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
} as const;

// Interface for AuthContext
interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    isLoading: boolean;
}

// Create context with undefined initial value for better type checking
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for accessing auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Memoize checkToken to prevent unnecessary re-renders
    const checkToken = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            const isValid = await validateToken(token);
            setIsAuthenticated(isValid);
        } catch (error) {
            console.error('Token validation failed:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle storage events
    useEffect(() => {
        checkToken();
        const handleStorageChange = () => checkToken();
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [checkToken]);

    // Memoized login function
    const login = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    // Memoized logout function
    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
        setIsAuthenticated(false);
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            isAuthenticated,
            login,
            logout,
            isLoading,
        }),
        [isAuthenticated, login, logout, isLoading]
    );

    // Render loading state
    if (isLoading) {
        return <div aria-live="polite">Loading authentication...</div>;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};