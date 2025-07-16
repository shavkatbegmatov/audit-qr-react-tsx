export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
} as const;

export const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VALIDATE_TOKEN: '/auth/validate-token-body',
    WS_LOGS: '/ws-logs',
} as const;

export const ROUTES = {
    LOGIN: '/login',
    ROOT: '/',
    AUDIT_OBJECT_TYPES: '/audit-object-types',
    AUDIT_LOGS: '/audit-logs',
    ROLES: '/roles',
    WILDCARD: '*',
} as const;