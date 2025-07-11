export interface LogEntry {
    id: number;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    user?: string;
    ip: string;
    timestamp: string;   // ISO-8601
}
