// src/pages/Tier3RiskTypesPage.tsx
import Table from '@/components/table/Table';
import type { Column } from '@/components/table/useTable';
import { ROUTES } from "@/utils/constants.ts";
import { formatDate } from '@/utils/dateUtils';

interface AuditType {
    id: number;
    code: string;
    name: string;
    description: string;
    status: string;
    parentId: number | null;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
}

export default function Tier3RiskTypesPage() {
    const columns: Column<AuditType>[] = [
        { key: 'id',          label: 'ID',          sortable: true },
        { key: 'code',        label: 'Code',        sortable: true },
        { key: 'name',        label: 'Name',        sortable: true },
        { key: 'description', label: 'Description', sortable: true},
        { key: 'status',      label: 'Status',      sortable: true },
        { key: 'parentId',    label: 'Parent ID (Tier2)',   sortable: true },
        { key: 'createdBy',   label: 'Created By',  sortable: true },
        { key: 'createdAt',   label: 'Created At',  sortable: true, render: (value) => formatDate(value) },
        { key: 'updatedBy',   label: 'Updated By',  sortable: true },
        { key: 'updatedAt',   label: 'Updated At',  sortable: true, render: (value) => formatDate(value) },
    ];

    return (
        <Table<AuditType>
            apiUrl={ROUTES.TIER_3_RISK_TYPES}
            columns={columns}
            parentApiUrl={ROUTES.TIER_2_RISK_TYPES}
            grandParentApiUrl={ROUTES.TIER_1_RISK_TYPES}
            parentDefaultLabel={"2-darajali risk"}
            grandParentDefaultLabel={"1-darajali risk"}
        />
    );
}