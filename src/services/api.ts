import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { AuthError } from './authService';

interface TokenResponse {
    success: boolean;
    data?: {
        accessToken: string;
        refreshToken: string;
    };
    error?: {
        code: number;
        message: string;
    };
    timestamp: string;
}

/**
 * Refreshes tokens using stored refresh token
 * @returns Promise resolving to new access token
 * @throws AuthError if refresh fails
 */
const refreshToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        window.location.href = '/login';
        throw new AuthError(401, 'No refresh token available');
    }

    try {
        const { data } = await axios.post<TokenResponse>(
            `${import.meta.env.VITE_API_URL}/auth/refresh`, // /api/v1 allaqachon VITE_API_URL da
            { refreshToken },
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!data.success || !data.data) {
            window.location.href = '/login';
            throw new AuthError(
                data.error?.code ?? 401,
                data.error?.message ?? 'Token refresh failed',
                data.timestamp
            );
        }

        const { accessToken, refreshToken: newRefreshToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        return accessToken;
    } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';

        if (error instanceof AuthError) {
            throw error;
        }

        let message = 'Unknown error';
        if (error instanceof AxiosError && error.response?.data?.error?.message) {
            message = error.response.data.error.message;
        } else if (error instanceof Error) {
            message = error.message;
        }

        throw new AuthError(401, `Token refresh failed: ${message}`);
    }
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Faqat VITE_API_URL, /api/v1 allaqachon ichida
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor to attach access token
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const isAuthCall = config.url?.startsWith('/auth/'); // /api/v1 allaqachon VITE_API_URL da
    const token = localStorage.getItem('accessToken');
    if (!isAuthCall && token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Response interceptor for handling 401 errors and token refresh
 */
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else if (token) resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest: InternalAxiosRequestConfig & { _retry?: boolean } = error.config!;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                try {
                    const token = await new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    originalRequest.headers!.Authorization = `Bearer ${token}`;
                    return axios(originalRequest);
                } catch (err) {
                    return Promise.reject(err);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const accessToken = await refreshToken();
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);
                originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;