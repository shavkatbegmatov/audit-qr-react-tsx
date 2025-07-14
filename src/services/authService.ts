import api from './api';
import { useNavigate } from 'react-router-dom';
import { AuthError, type TokenPair, type TokenResponse } from '@/types/AuthTypes';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants';
import { handleAuthError } from '@/utils/handleAuthError';

export async function validateToken(token: string): Promise<boolean> {
    try {
        const response = await api.post(API_ENDPOINTS.VALIDATE_TOKEN, { token });
        return response.data.success === true;
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
}

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
        throw handleAuthError(error);
    }
}

const useAuthService = () => {
    const navigate = useNavigate();

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
            localStorage.setItem('username', username.trim()); // Yangi: Username saqlash

            return { accessToken, refreshToken };
        } catch (error) {
            throw handleAuthError(error, navigate);
        }
    };

    const logout = async (): Promise<void> => {
        if (!navigator.onLine) {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem('username'); // Yangi: Username olib tashlash
            navigate('/login', { state: { offline: true } });
            throw new AuthError(0, 'Logout failed due to no internet connection');
        }

        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!accessToken) {
            throw new AuthError(401, 'No access token available');
        }

        const isValid = await validateToken(accessToken);
        if (!isValid) {
            throw new AuthError(401, 'Invalid or expired access token');
        }

        try {
            const response = await api.post(API_ENDPOINTS.LOGOUT, {}, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.status !== 200 || !response.data.success) {
                throw new Error('Logout response invalid');
            }
        } catch (error) {
            throw handleAuthError(error, navigate);
        } finally {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem('username'); // Yangi: Username olib tashlash
            // Removed navigate from here to avoid redundancy; handled in caller or context
        }
    };

    return { login, logout, refreshToken, validateToken };
};

export default useAuthService;