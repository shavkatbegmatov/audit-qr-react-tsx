// src/types/ApiTypes.ts

/**
 * API dan qaytadigan xatolik obyekti uchun interfeys
 */
export interface ApiError {
    code: number;
    message: string;
}

/**
 * API dan qaytadigan umumiy javob strukturasi uchun generic interfeys.
 * T - `data` maydonidagi ma'lumotning turini ifodalaydi.
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    timestamp: string;
}

/**
 * Pagination qilingan ro'yxatlar uchun javob sahifasi haqida ma'lumot
 */
export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

/**
 * Pagination qilingan ma'lumotlar uchun generic interfeys
 */
export interface PaginatedData<T> {
    content: T[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

/**
 * Pagination qilingan ro'yxatlar uchun to'liq API javobi
 * Masalan: Foydalanuvchilar ro'yxatini so'raganda shu tipdagi javob keladi.
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;