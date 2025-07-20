import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS, ROUTES } from '@/utils/constants'; // ROUTES ni import qo'shing, agar allaqachon bo'lmasa
import { refreshToken } from './authService';
import { handleAuthError } from '@/utils/handleAuthError';
import { AuthError } from '@/types/AuthTypes'; // AuthError ni import qo'shing, agar kerak bo'lsa

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const isAuthCall = config.url?.startsWith('/auth/');
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!isAuthCall && token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
                throw handleAuthError(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Yangi: 403 ni handle qilish - rol yo'qolganida login ga qaytish
        if (error.response?.status === 403) {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            window.location.href = ROUTES.LOGIN; // Login sahifasiga redirect
            return Promise.reject(new AuthError(403, 'Forbidden: Insufficient permissions - relogin required'));
        }

        return Promise.reject(error);
    }
);

export default api;