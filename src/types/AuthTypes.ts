// src/types/AuthTypes.ts

export interface TokenResponse {
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

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class AuthError extends Error {
    public readonly code: number;
    public readonly timestamp: string | undefined;
    constructor(code: number, message: string, timestamp?: string) {
        super(message);
        this.code = code;
        this.timestamp = timestamp;
        this.name = 'AuthError';
    }
}