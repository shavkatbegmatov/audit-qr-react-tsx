import { type AxiosInstance, AxiosError } from 'axios';
import api from './api';
import authService from './authService';

interface TokenResponse {
    success: boolean;
    data?: {
        accessToken: string;
        refreshToken: string;
    }
    error?: {
        code: number;
        message: string;
    }
    timestamp: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export async function validateToken(token: string): Promise<boolean> {
    try {
        const response = await api.post('/validate-token-body', { token });
        return response.data.success === true;
    } catch (err) {
        console.error('Token validation failed: ', err);
        return false;
    }
}

class TokenService {
    private readonly api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async refreshToken(): Promise<TokenPair> {
        const storedRefresh = localStorage.getItem('refreshToken');
        if (!storedRefresh) {
            authService.logout();
            throw new Error('No refresh token stored');
        }

        try {
            const response = await this.api.post<TokenResponse>('/refresh', {
                refreshToken: storedRefresh,
            });
            const body = response.data;

            if (!body.success || !body.data) {
                authService.logout();
                const msg = body.error?.message ?? 'Token refresh failed';
                throw new Error(msg);
            }

            const { accessToken, refreshToken } = body.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            return { accessToken, refreshToken };

        } catch (err: unknown) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            authService.logout();

            let message = 'Unknown error';
            if (err instanceof Error) {
                message = err.message;
            } else if ((err as AxiosError).isAxiosError) {
                const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
                message = axiosErr.response?.data.error?.message ?? axiosErr.message;
            }

            throw new Error(`Token refresh failed: ${message}`);
        }
    }
}

export default new TokenService(api);
