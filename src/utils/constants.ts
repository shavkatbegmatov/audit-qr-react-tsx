// src/utils/constants.ts
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
    DASHBOARD: '/',
    ROOT: '/',
    REFERENCE: '/references',
    AUDIT_OBJECT_TYPES: '/audit-object-types',
    AUDIT_OBJECT_BRANCH_NETWORKS: '/audit-object-branch-networks',
    AUDIT_OBJECTS: '/audit-objects',
    AUDIT_LOGS: '/audit-logs',
    ROLES: '/roles',
    USERS: '/users',
    WILDCARD: '*',
} as const;