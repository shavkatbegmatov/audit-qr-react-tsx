// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { validateToken, refreshToken } from '@/services/authService';
import { STORAGE_KEYS, ROUTES } from '@/utils/constants';
import useAuthService from '@/services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: () => Promise<void>;
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
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { logout: serviceLogout } = useAuthService();
    const navigate = useNavigate();

    const checkToken = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            if (!token) {
                setIsAuthenticated(false);
                setIsAdmin(false);
                return false;
            }
            const isValid = await validateToken(token);
            if (isValid) {
                const decoded: { authorities?: string[] } = jwtDecode(token);
                const roles = decoded.authorities || [];
                setIsAdmin(roles.includes('ROLE_ADMIN'));
                setIsAuthenticated(true);
                return true;
            } else {
                // Yangi qism: Invalid token bo'lsa, tokenlarni o'chirib, logout qiling
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                if (STORAGE_KEYS.REFRESH_TOKEN) {
                    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                }
                setIsAuthenticated(false);
                setIsAdmin(false);
                navigate(ROUTES.LOGIN, { replace: true }); // Agar kerak bo'lsa, to'g'ridan-to'g'ri redirect
                return false;
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            // Xatolikda ham tokenlarni o'chirish
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            if (STORAGE_KEYS.REFRESH_TOKEN) {
                localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            }
            setIsAuthenticated(false);
            setIsAdmin(false);
            navigate(ROUTES.LOGIN, { replace: true });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [navigate]); // navigate ni dependency qo'shing, agar u useCallback da ishlatilsa

    const autoRefreshToken = useCallback(async () => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) return;

        try {
            const decoded: { exp?: number } = jwtDecode(token);
            if (!decoded.exp) return;

            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = decoded.exp - currentTime;

            if (timeUntilExpiry <= 30) {
                console.log('Token muddati tugashiga yaqin – refresh qilinmoqda');
                await refreshToken();
                await checkToken();
            }
        } catch (error) {
            console.error('Auto refresh failed:', error);
            // await handleLogout();
        }
    }, []);

    useEffect(() => {
        checkToken();
        const handleStorageChange = () => checkToken();
        window.addEventListener('storage', handleStorageChange);

        const refreshInterval = setInterval(autoRefreshToken, 10000);

        const tokenCheckInterval = setInterval(async () => {
            if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
                // await handleLogout();
            }
        }, 5000);

        const handleVisibilityChange = async () => {
            console.log('Visibility changed:', document.visibilityState);
            if (document.visibilityState === 'visible') {
                await checkToken();
                if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
                    // await handleLogout();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(refreshInterval);
            clearInterval(tokenCheckInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [checkToken, autoRefreshToken]);

    const handleLogin = useCallback(async () => {
        await checkToken();
        setIsAuthenticated(true);
    }, [checkToken]);

    const handleLogout = useCallback(async () => {
        await serviceLogout();
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (STORAGE_KEYS.REFRESH_TOKEN) {
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
        setIsAuthenticated(false);
        setIsAdmin(false);
        navigate(ROUTES.LOGIN, { replace: true });
    }, [serviceLogout, navigate]);

    const contextValue = useMemo(
        () => ({
            isAuthenticated,
            isAdmin,
            login: handleLogin,
            logout: handleLogout,
            isLoading,
        }),
        [isAuthenticated, isAdmin, handleLogin, handleLogout, isLoading]
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