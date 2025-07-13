import { AxiosError } from 'axios';
import { AuthError } from '@/types/AuthTypes';
import { STORAGE_KEYS } from './constants';

export function handleAuthError(error: unknown, navigate?: (path: string) => void): AuthError {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (navigate) {
        navigate('/login');
    } else {
        window.location.href = '/login';
    }

    let message = 'Unknown error';
    let code = 500;
    let timestamp: string | undefined;

    if (error instanceof AuthError) {
        return error;
    }

    if (error instanceof AxiosError && error.response?.data) {
        const data = error.response.data as { error?: { code: number; message: string }; timestamp?: string };
        code = data.error?.code ?? error.response.status;
        message = data.error?.message ?? 'Request failed';
        timestamp = data.timestamp;
    } else if (error instanceof Error) {
        message = error.message;
    }

    return new AuthError(code, message, timestamp);
}