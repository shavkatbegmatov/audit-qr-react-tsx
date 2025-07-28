// src/pages/Tier3RiskTypesPage.tsx
import Table from '@/components/table/Table';
import type { Column } from '@/components/table/useTable';
import { ROUTES } from "@/utils/constants.ts";

interface AuditType {
    id: number;
    code: string;
    name: string;
    description: string;
    status: string;
}

export default function Tier3RiskTypesPage() {
    const columns: Column<AuditType>[] = [
        { key: 'id',          label: 'ID',          sortable: true },
        { key: 'code',        label: 'Code',        sortable: true },
        { key: 'name',        label: 'Name',        sortable: true },
        { key: 'description', label: 'Description', sortable: true},
        { key: 'status',      label: 'Status',      sortable: true },
    ];

    return (
        <Table<AuditType>
            apiUrl={ROUTES.TIER_3_RISK_TYPES}
            columns={columns}
        />
    );
}