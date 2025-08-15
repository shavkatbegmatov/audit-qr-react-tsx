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
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { logout: apiLogout } = useAuthService();

    const markLoggedOut = useCallback((redirect: boolean) => {
        setIsAuthenticated(false);
        setIsAdmin(false);
        if (redirect) navigate(ROUTES.LOGIN, { replace: true });
    }, [navigate]);

    const checkToken = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const at = getAccess();
            const rt = getRefresh();
            if (!at) {
                if (rt) {
                    await refreshToken();
                } else {
                    clearTokens();
                    markLoggedOut(false);
                    return false;
                }
            } else {
                const ok = await validateToken(at);
                if (!ok) {
                    if (rt) {
                        await refreshToken();
                    } else {
                        clearTokens();
                        markLoggedOut(false);
                        return false;
                    }
                }
            }
            const fresh = getAccess();
            if (!fresh) {
                clearTokens();
                markLoggedOut(false);
                return false;
            }
            const { authorities = [] } = jwtDecode<JwtPayload>(fresh);
            setIsAdmin(authorities.includes('ROLE_ADMIN'));
            setIsAuthenticated(true);
            return true;
        } catch {
            clearTokens();
            markLoggedOut(false);
            return false;
        } finally {
            setIsLoading(false);
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
                await checkToken();
            }
        } catch {
            // Ignore for now, as checkToken will handle errors
        }
    }, [checkToken]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const ok = await checkToken();
            if (!ok && mounted) navigate(ROUTES.LOGIN, { replace: true });
        })();

        const onStorage = () => { void checkToken(); };
        window.addEventListener('storage', onStorage);

        const onVisibilityChange = async () => {
            if (document.visibilityState === 'visible') await checkToken();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        const interval = setInterval(autoRefreshToken, 10000);

        return () => {
            mounted = false;
            window.removeEventListener('storage', onStorage);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            clearInterval(interval);
        };
    }, [checkToken, autoRefreshToken, navigate]);

    const login = useCallback(async () => { await checkToken(); }, [checkToken]);

    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } catch (err) {
            console.warn('logout failed (ignored)', err);
        } finally {
            clearTokens();
            markLoggedOut(true);
        }
    }, [apiLogout, markLoggedOut]);

    const value = useMemo<AuthContextType>(() => ({
        isAuthenticated, isAdmin, login, logout, isLoading
    }), [isAuthenticated, isAdmin, login, logout, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {isLoading ? (
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