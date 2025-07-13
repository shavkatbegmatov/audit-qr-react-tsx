import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { validateToken } from '@/services/authService';
import { STORAGE_KEYS } from '@/utils/constants';
import useAuthService from '@/services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { logout } = useAuthService();

    const checkToken = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            if (!token) {
                setIsAuthenticated(false);
                setIsLoading(false);
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

    const handleLogin = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    const contextValue = useMemo(
        () => ({
            isAuthenticated,
            login: handleLogin,
            logout,
            isLoading,
        }),
        [isAuthenticated, handleLogin, logout, isLoading]
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