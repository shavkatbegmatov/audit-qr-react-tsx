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
     * Validates the access token
     * @param token - The token to validate
     * @returns Promise resolving to boolean
     */
    const validateTokenLocally = async (token: string): Promise<boolean> => {
        try {
            const response = await api.post('/auth/validate-token-body', { token });
            return response.data.success === true;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    };

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
            const { data } = await api.post<TokenResponse>('/auth/login', {
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
        if (!navigator.onLine) {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            navigate('/login', { state: { offline: true } });
            throw new AuthError(0, 'Logout failed due to no internet connection');
        }

        if (!accessToken) {
            console.warn('No access token available for logout');
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            navigate('/login');
            throw new AuthError(401, 'No access token available');
        }

        const isValid = await validateTokenLocally(accessToken);
        if (!isValid) {
            console.warn('Access token is invalid or expired during logout');
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            navigate('/login');
            throw new AuthError(401, 'Invalid or expired access token');
        }

        try {
            const response = await api.post('/auth/logout', {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (response.status === 200 && response.data.success) {
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                navigate('/login');
            } else {
                throw new Error('Logout response invalid');
            }
        } catch (error) {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            navigate('/login', { state: { logoutError: 'Logout failed due to server error' } });
            if (axios.isAxiosError(error)) {
                const body = error.response?.data as TokenResponse;
                throw new AuthError(
                    body?.error?.code ?? error.response?.status ?? 500,
                    body?.error?.message ?? 'Logout failed',
                    body?.timestamp
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
            logout();
            throw new AuthError(401, 'No refresh token available');
        }

        try {
            const { data } = await api.post<TokenResponse>('/auth/refresh', { refreshToken });

            if (!data.success || !data.data) {
                logout();
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