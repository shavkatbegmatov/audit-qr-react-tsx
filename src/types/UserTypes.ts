// src/types/UserTypes.ts

/**
 * Foydalanuvchi roli uchun interfeys
 */
export interface UserRole {
    id: number;
    name: string;
    description: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    createdBy?: string | null;
    createdAt?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
}

/**
 * Tizim foydalanuvchisi uchun batafsil interfeys
 */
export interface User {
    id: number;
    username: string;
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    middleName: string | null;
    hrEmpsId: number | null;
    description: string | null;
    enabled: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    roles: UserRole[];
}