export interface LogEntry {
    id: number;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    user?: string;
    ip: string;
    timestamp: string;   // ISO-8601
}

export interface AuditLog {
    userId: number | null;
    username: string;
    action: string;
    timestamp: string; // OffsetDateTime string formatida
    ipAddress: string;
    outcome: boolean;
    details: string | undefined;
}