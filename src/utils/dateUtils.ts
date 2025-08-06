// src/utils/dateUtils.ts
export function formatDate(isoString: string, includeSeconds: boolean = false): string {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return 'N/A';
    }
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    let formatted = `${day}.${month}.${year} ${hours}:${minutes}`;
    if (includeSeconds) {
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        formatted += `:${seconds}`;
    }
    return formatted;
}