import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { validateToken } from '../services/tokenService';
import useAuthService from '../services/authService';

// Interface for AuthContext
interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

// Create context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook for accessing auth context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * Authentication provider component
 * @param children - Child components to render
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { login, logout } = useAuthService();

    const checkToken = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
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

    useEffect(() => {
        checkToken();
        const handleStorageChange = () => checkToken();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [checkToken]);

    const handleLogin = useCallback(
        async (username: string, password: string) => {
            try {
                await login(username, password);
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
                throw error;
            }
        },
        [login]
    );

    const handleLogout = useCallback(async () => {
        try {
            await logout();
            setIsAuthenticated(false);
        } catch (error) {
            setIsAuthenticated(false);
            throw error;
        }
    }, [logout]);

    const contextValue = useMemo(
        () => ({
            isAuthenticated,
            login: handleLogin,
            logout: handleLogout,
            isLoading,
        }),
        [isAuthenticated, handleLogin, handleLogout, isLoading]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen" aria-live="polite">
                    Loading...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};