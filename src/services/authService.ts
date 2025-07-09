import { useNavigate } from 'react-router-dom';
import api from './api';
import axios from 'axios';

// Constants for storage keys
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
} as const;

// Custom error class for authentication errors
export class AuthError extends Error {
    public readonly _code: number;
    public readonly _timestamp: string | undefined;
    constructor(code: number, message: string, timestamp?: string) {
        super(message);
        this._code = code;
        this._timestamp = timestamp;
        this.name = 'AuthError';
    }
}

// Interface for token response
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

// Interface for token pair
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

/**
 * Custom hook for handling authentication-related operations
 * @returns Authentication service methods (login, logout, refreshToken)
 */
const useAuthService = () => {
    const navigate = useNavigate();

    /**
     * Logs in a user with provided credentials
     * @param username - User's username
     * @param password - User's password
     * @returns Promise resolving to token pair
     * @throws AuthError if login fails
     */
    const login = async (username: string, password: string): Promise<TokenPair> => {
        if (!username?.trim() || !password?.trim()) {
            throw new AuthError(400, 'Username and password are required');
        }

        try {
            const { data } = await api.post<TokenResponse>('/login', {
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

            return { accessToken, refreshToken };
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            if (axios.isAxiosError(error) && error.response?.data) {
                const body = error.response.data as TokenResponse;
                throw new AuthError(
                    body.error?.code ?? error.response.status,
                    body.error?.message ?? 'Login failed',
                    body.timestamp
                );
            }
            throw new AuthError(500, 'Unexpected error during login');
        }
    };

    /**
     * Logs out the current user by calling the backend logout endpoint and clearing local storage
     * @throws AuthError if logout fails
     */
    const logout = async (): Promise<void> => {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        try {
            if (accessToken) {
                // Backend logout endpointini chaqirish
                await api.post('/api/v1/auth/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            }
            // Local storage'dan tokenlarni o'chirish
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            // Login sahifasiga yo'naltirish
            navigate('/login');
        } catch (error) {
            // Xatolarni ushlash va log qilish
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            navigate('/login');
            if (axios.isAxiosError(error) && error.response?.data) {
                const body = error.response.data as TokenResponse;
                throw new AuthError(
                    body.error?.code ?? error.response.status,
                    body.error?.message ?? 'Logout failed',
                    body.timestamp
                );
            }
            throw new AuthError(500, 'Unexpected error during logout');
        }
    };

    /**
     * Refreshes the access token using the stored refresh token
     * @returns Promise resolving to new token pair
     * @throws AuthError if refresh fails
     */
    const refreshToken = async (): Promise<TokenPair> => {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
            await logout();
            throw new AuthError(401, 'No refresh token available');
        }

        try {
            const { data } = await api.post<TokenResponse>('/api/v1/auth/refresh', { refreshToken });

            if (!data.success || !data.data) {
                await logout();
                throw new AuthError(
                    data.error?.code ?? 401,
                    data.error?.message ?? 'Token refresh failed',
                    data.timestamp
                );
            }

            const { accessToken, refreshToken: newRefreshToken } = data.data;
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            navigate('/login');
            if (error instanceof AuthError) {
                throw error;
            }
            throw new AuthError(
                500,
                `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    };

    return { login, logout, refreshToken };
};

export default useAuthService;