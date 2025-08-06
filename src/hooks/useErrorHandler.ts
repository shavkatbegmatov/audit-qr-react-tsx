// src/hooks/useErrorHandler.ts
export function handleApiError(error: unknown): string {
    let errMsg = 'Xatolik yuz berdi. Iltimos, qayta urunib ko\'ring.';
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { error?: { message?: string } } } }).response;
        errMsg = response?.data?.error?.message || errMsg;
    } else if (error instanceof Error) {
        errMsg = error.message;
    }
    return errMsg;
}