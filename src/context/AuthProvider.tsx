// src/context/AuthProvider.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType } from './auth-context';
import { STORAGE_KEYS, ROUTES } from '@/utils/constants';
import { validateToken, refreshToken } from '@/services/authService';
import useAuthService from '@/services/authService';

type JwtPayload = { authorities?: string[]; exp?: number };

const getAccess = () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
const getRefresh = () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
const clearTokens = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    // Dastlabki yuklanish uchun alohida state
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const navigate = useNavigate();
    const { logout: apiLogout } = useAuthService();

    const markLoggedOut = useCallback((redirect: boolean) => {
        setIsAuthenticated(false);
        setIsAdmin(false);
        clearTokens();
        if (redirect) navigate(ROUTES.LOGIN, { replace: true });
    }, [navigate]);

    // Barcha tekshiruv mantig'ini o'z ichiga olgan asosiy funksiya
    const performAuthCheck = useCallback(async (): Promise<boolean> => {
        try {
            let at = getAccess();
            const rt = getRefresh();

            if (!at) {
                if (rt) {
                    at = await refreshToken(); // Yangilangan tokenni olamiz
                } else {
                    markLoggedOut(false);
                    return false;
                }
            } else {
                const ok = await validateToken(at);
                if (!ok) {
                    if (rt) {
                        at = await refreshToken();
                    } else {
                        markLoggedOut(false);
                        return false;
                    }
                }
            }

            // Yangilangan tokenni qayta tekshirish
            const fresh = getAccess();
            if (!fresh) {
                markLoggedOut(false);
                return false;
            }

            const { authorities = [] } = jwtDecode<JwtPayload>(fresh);
            setIsAdmin(authorities.includes('ROLE_ADMIN'));
            setIsAuthenticated(true);
            return true;
        } catch {
            markLoggedOut(false);
            return false;
        }
    }, [markLoggedOut]);


    const autoRefreshToken = useCallback(async () => {
        const access = getAccess();
        if (!access) return;

        try {
            const { exp } = jwtDecode<JwtPayload>(access);
            if (!exp) return;
            const now = Math.floor(Date.now() / 1000);
            const secondsLeft = exp - now;

            if (secondsLeft <= 30) {
                await refreshToken();
            }
        } catch {
            // Xatoliklarni performAuthCheck hal qiladi
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        // 1. Dastlabki, bloklaydigan tekshiruv
        (async () => {
            const ok = await performAuthCheck();
            if (!ok && mounted) {
                navigate(ROUTES.LOGIN, { replace: true });
            }
            // Dastlabki yuklanish tugadi
            setIsInitialLoading(false);
        })();

        // 2. Fon rejimida, bloklamaydigan tekshiruvlar
        const onStorage = () => { void performAuthCheck(); };
        window.addEventListener('storage', onStorage);

        const onVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                await performAuthCheck();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        const interval = setInterval(autoRefreshToken, 10000);

        return () => {
            mounted = false;
            window.removeEventListener('storage', onStorage);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            clearInterval(interval);
        };
        // dependencylarni to'g'rilaymiz
    }, [performAuthCheck, autoRefreshToken, navigate]);

    const login = useCallback(async () => { await performAuthCheck(); }, [performAuthCheck]);

    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } catch (err) {
            console.warn('logout failed (ignored)', err);
        } finally {
            markLoggedOut(true);
        }
    }, [apiLogout, markLoggedOut]);

    const value = useMemo<AuthContextType>(() => ({
        isAuthenticated,
        isAdmin,
        login,
        logout,
        isLoading: isInitialLoading // Faqat dastlabki yuklanishda true bo'ladi
    }), [isAuthenticated, isAdmin, login, logout, isInitialLoading]);

    return (
        <AuthContext.Provider value={value}>
            {isInitialLoading ? (
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Loading...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export default AuthProvider;