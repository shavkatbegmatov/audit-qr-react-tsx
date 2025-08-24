// src/types/AuditorTypes.ts

/**
 * Auditor roli uchun interfeys
 */
export interface AuditorRole {
    id: number;
    name: string;
}

/**
 * Auditor statusi uchun turlar
 */
export type AuditorStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

/**
 * Tizim auditori uchun batafsil interfeys
 */
export interface Auditor {
    id: number;
    username: string;
    fullName: string | null;
    enabled: boolean;
    status: AuditorStatus;
    orgUnitId?: number | null;
    orgUnitCode?: string | null;
    orgUnitName?: string | null;
    roles: AuditorRole[];
    lastLoginAt?: string | null;
    createdAt: string;
    auditsCount?: number | null;
    risksCount?: number | null;
}