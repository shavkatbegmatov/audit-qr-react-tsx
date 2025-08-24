// src/types/AuditObjectTypes.ts

/**
 * Audit obyekti turining statusi uchun turlar
 */
export type AuditObjectStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

/**
 * Audit obyekti turi uchun batafsil interfeys
 */
export interface AuditObjectType {
    id: number;
    code: string;
    name: string;
    description: string | null;
    status: AuditObjectStatus;
    parentId: number | null;
    createdBy: string | null;
    createdAt: string;
    updatedBy: string | null;
    updatedAt: string;
}