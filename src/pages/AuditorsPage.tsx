// src/pages/AuditorsPage.tsx

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus, FaUserShield } from 'react-icons/fa';

// Asosiy komponentlar
import Table from '@/components/table/Table';
import type { Column as BaseColumn } from '@/components/table/useTable';
import Badge from '@/components/ui/Badge';
import UiButton from '@/components/ui/UiButton';

// Yordamchi funksiyalar va konstantalar
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/dateUtils';

// Interfeyslar (Types)
interface RoleType {
    id: number;
    name: string;
}

type AuditorStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

interface AuditorType {
    id: number;
    username: string;
    fullName: string | null;
    enabled: boolean;
    status: AuditorStatus;
    orgUnitId?: number | null;
    orgUnitCode?: string | null;
    orgUnitName?: string | null;
    roles: RoleType[];
    lastLoginAt?: string | null;
    createdAt: string;
    auditsCount?: number | null;
    risksCount?: number | null;
}

// Yordamchi Render Funksiyalar
const getStatusBadgeVariant = (status: AuditorStatus) => {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'INACTIVE': return 'danger';
        case 'PENDING': return 'warning';
        default: return 'secondary';
    }
};

// Sahifa Komponenti (AuditorsPage)
export default function AuditorsPage() {
    const navigate = useNavigate();

    const columns: BaseColumn<AuditorType>[] = useMemo(
        () => [
            { key: 'id', label: 'ID', sortable: true, width: '80px' },
            {
                key: 'fullName',
                label: 'To\'liq Ism',
                sortable: true,
                render: (value: AuditorType['fullName'], row: AuditorType) => (
                    <div className="flex items-center gap-2">
                        <FaUserShield className="text-gray-400" />
                        <span className="font-medium">{value ?? row.username}</span>
                    </div>
                ),
            },
            {
                key: 'orgUnitName',
                label: 'Tarkibiy Bo\'linma',
                sortable: true,
                render: (value: AuditorType['orgUnitName'], row: AuditorType) =>
                    `${row.orgUnitCode ?? ''} ${value ?? ''}`.trim() || 'N/A',
            },
            {
                key: 'roles',
                label: 'Rollar',
                render: (value: AuditorType['roles']) =>
                    value?.length > 0
                        ? value.map((r: RoleType) => <Badge key={r.id} variant="info">{r.name}</Badge>)
                        : '—',
            },
            {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (value: AuditorType['status']) => (
                    <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>
                ),
            },
            {
                key: 'enabled',
                label: 'Aktiv',
                sortable: true,
                render: (value: AuditorType['enabled']) => (
                    <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Ha' : 'Yo\'q'}</Badge>
                ),
            },
            {
                key: 'auditsCount',
                label: 'Auditlar',
                sortable: true,
                align: 'center',
                render: (v: AuditorType['auditsCount']) => (typeof v === 'number' ? v : '—'),
            },
            {
                key: 'lastLoginAt',
                label: 'Oxirgi Kirish',
                sortable: true,
                render: (value: AuditorType['lastLoginAt']) => (value ? formatDate(value, true) : '—'),
            },
            {
                key: 'actions',
                label: 'Harakatlar',
                align: 'center',
                width: '120px',
                render: (_: any, row: AuditorType) => (
                    <div className="flex justify-center gap-2">
                        <UiButton
                            variant="icon"
                            size="sm"
                            onClick={() => navigate(ROUTES.AUDITOR_DETAIL.replace(':id', row.id.toString()))}
                            title="Tahrirlash"
                        >
                            <FaEdit />
                        </UiButton>
                        <UiButton
                            variant="icon"
                            size="sm"
                            color="danger"
                            onClick={() => console.warn(`O'chirish: ${row.id}`)}
                            title="O'chirish"
                        >
                            <FaTrashAlt />
                        </UiButton>
                    </div>
                ),
            },
        ],
        [navigate]
    );

    return (
        <div className="p-4 space-y-4">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Auditorlar Boshqaruvi</h1>
                <UiButton
                    variant="primary"
                    onClick={() => navigate(ROUTES.AUDITORS_CREATE)}
                >
                    <FaPlus className="mr-2" />
                    Yangi auditor qo'shish
                </UiButton>
            </header>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table<AuditorType>
                    apiUrl={ROUTES.AUDITORS}
                    columns={columns}
                />
            </div>
        </div>
    );
}