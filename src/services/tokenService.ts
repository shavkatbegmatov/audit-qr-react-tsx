import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { AuthError, type TokenPair } from './authService';

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
 * Validates a JWT token
 * @param token - The token to validate
 * @returns Promise resolving to boolean indicating if token is valid
 */
export async function validateToken(token: string): Promise<boolean> {
    try {
        const response = await api.post('/api/v1/auth/validate-token-body', { token });
        return response.data.success === true;
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
}

/**
 * Custom hook for handling token-related operations
 * @returns Token service methods (refreshToken)
 */
const useTokenService = () => {
    const navigate = useNavigate();

    /**
     * Refreshes tokens using stored refresh token
     * @returns Promise resolving to new token pair
     * @throws AuthError if refresh fails
     */
    const refreshToken = async (): Promise<TokenPair> => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.warn('No refresh token available in localStorage');
            navigate('/login');
            throw new AuthError(401, 'No refresh token available');
        }

        try {
            const { data } = await api.post<TokenResponse>('/api/v1/auth/refresh', { refreshToken });

            if (!data.success || !data.data) {
                console.warn('Token refresh failed:', data.error?.message);
                navigate('/login');
                throw new AuthError(
                    data.error?.code ?? 401,
                    data.error?.message ?? 'Token refresh failed',
                    data.timestamp
                );
            }

            const { accessToken, refreshToken: newRefreshToken } = data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            console.error('Refresh token error:', error);
            navigate('/login');

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

    return { refreshToken };
};

export default useTokenService;