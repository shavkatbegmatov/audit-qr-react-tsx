import api from './api';
import { useNavigate } from 'react-router-dom';
import { AuthError, type TokenPair, type TokenResponse } from '@/types/AuthTypes';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants';
import { handleAuthError } from '@/utils/handleAuthError';

/**
 * Access tokenni serverda tekshiradi.
 * @param token - Tekshiriladigan access token.
 * @returns Token haqiqiy bo'lsa `true`, aks holda `false`.
 */
export async function validateToken(token: string): Promise<boolean> {
    try {
        const response = await api.post(API_ENDPOINTS.VALIDATE_TOKEN, { token });
        console.log('---- ', response);
        return response.data.success === true;
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
}

/**
 * Refresh token yordamida yangi access token oladi.
 * @returns Yangi olingan access token.
 */
export async function refreshToken(): Promise<string> {
    const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshTokenValue) {
        throw new AuthError(401, 'No refresh token available');
    }

    try {
        const { data } = await api.post<TokenResponse>(API_ENDPOINTS.REFRESH, { refreshToken: refreshTokenValue });
        if (!data.success || !data.data) {
            throw new AuthError(
                data.error?.code ?? 401,
                data.error?.message ?? 'Token refresh failed',
                data.timestamp
            );
        }

        const { accessToken, refreshToken: newRefreshToken } = data.data;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        return accessToken;
    } catch (error) {
        // Xatolikni qayta ishlab, tashqariga uzatadi
        throw handleAuthError(error);
    }
}

/**
 * Autentifikatsiya bilan bog'liq harakatlar uchun maxsus hook.
 * login va logout funksiyalarini o'z ichiga oladi.
 */
const useAuthService = () => {
    const navigate = useNavigate();

    /**
     * Tizimga kirish (login).
     * @param username - Foydalanuvchi nomi.
     * @param password - Foydalanuvchi paroli.
     * @returns Access va refresh tokenlar juftligi.
     */
    const login = async (username: string, password: string): Promise<TokenPair> => {
        if (!username?.trim() || !password?.trim()) {
            throw new AuthError(400, 'Username and password are required');
        }

        try {
            const { data } = await api.post<TokenResponse>(API_ENDPOINTS.LOGIN, {
                username: username.trim(),
                password: password.trim(),
            });

            if (!data.success || !data.data) {
                throw new AuthError(
                    data.error?.code ?? 400,
                    data.error?.message ?? 'Login failed',
                    data.timestamp
                );
            }

            const { accessToken, refreshToken } = data.data;
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            localStorage.setItem('username', username.trim());

            return { accessToken, refreshToken };
        } catch (error) {
            // Xatolikni `Maps` bilan birga qayta ishlaydi
            throw handleAuthError(error, navigate);
        }
    };

    /**
     * Tizimdan chiqish (logout).
     * Serverga so'rov yuboradi va har doim lokal ma'lumotlarni tozalaydi.
     */
    const logout = async (): Promise<void> => {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (accessToken && navigator.onLine) {
            try {
                // Serverga xabar berishga harakat qilamiz (best effort)
                await api.post(API_ENDPOINTS.LOGOUT, {}, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            } catch (error) {
                console.error('Server logout failed, but continuing with client-side cleanup:', error);
                // Xatolikka e'tibor bermay, tozalashda davom etamiz
            }
        }

        // Har qanday holatda lokal xotirani tozalaymiz
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem('username');
    };

    return { login, logout };
};

export default useAuthService;