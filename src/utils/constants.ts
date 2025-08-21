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
    HOME: '/',
    ROOT: '/',
    REFERENCE: '/references',
    AUDIT_OBJECT_TYPES: '/audit-object-types',
    AUDIT_OBJECT_BRANCH_NETWORKS: '/audit-object-branch-networks',
    AUDIT_OBJECTS: '/audit-objects',
    BLOCK: '/blocks',
    ORG_STRUCTURE: '/org-structure',
    SUBJECT_SECTIONS: '/subject-sections',
    RISK_REGISTRY: '/risk-registry',
    TIER_1_RISK_TYPES: '/tier1-risk-types',
    TIER_2_RISK_TYPES: '/tier2-risk-types',
    TIER_3_RISK_TYPES: '/tier3-risk-types',
    AUDIT_LOGS: '/audit-logs',
    ROLES: '/roles',
    USERS: '/users',
    WILDCARD: '*',
} as const;