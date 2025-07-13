import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode'; // Yangi import: jwt-decode
import { validateToken, refreshToken } from '@/services/authService'; // refreshToken ni shu yerdan oling
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
    const { logout: serviceLogout } = useAuthService();

    const checkToken = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
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

    // Yangi funksiya: Token muddatini tekshirib, refresh qilish
    const autoRefreshToken = useCallback(async () => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) return;

        try {
            const decoded: { exp?: number } = jwtDecode(token); // Tokenni decode qilish
            if (!decoded.exp) return;

            const currentTime = Math.floor(Date.now() / 1000); // Hozirgi vaqt (sekundlarda)
            const timeUntilExpiry = decoded.exp - currentTime;

            if (timeUntilExpiry <= 30) { // 30 soniya qolganda refresh
                console.log('Token muddati tugashiga yaqin – refresh qilinmoqda');
                await refreshToken(); // Yangi token olish (localStorage ga saqlanadi)
                setIsAuthenticated(true); // Autentifikatsiyani yangilash
            }
        } catch (error) {
            console.error('Auto refresh failed:', error);
            // Agar decode xato bo'lsa, logout qilish mumkin
            await handleLogout();
        }
    }, []);

    useEffect(() => {
        checkToken();
        const handleStorageChange = () => checkToken();
        window.addEventListener('storage', handleStorageChange);

        // Yangi: Har 10 soniyada tokenni tekshirish intervali
        const refreshInterval = setInterval(autoRefreshToken, 10000); // Har 10 soniyada tekshirish

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(refreshInterval); // Intervalni tozalash
        };
    }, [checkToken, autoRefreshToken]);

    const handleLogin = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    const handleLogout = useCallback(async () => {
        await serviceLogout();
        setIsAuthenticated(false);
    }, [serviceLogout]);

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