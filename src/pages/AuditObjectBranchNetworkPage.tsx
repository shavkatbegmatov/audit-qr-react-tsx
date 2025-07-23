// src/pages/AuditObjectBranchNetworkPage.tsx
import Table from '@/components/table/Table';
import type { Column } from '@/components/table/useTable';
import { ROUTES } from "@/utils/constants.ts";

interface AuditObjectBranchNetwork {
    id: number;
    code: string;
    name: string;
    description: string;
    mfoCode: string;
    status: string;
    auditObjectId: number;
}

export default function AuditObjectBranchNetworkPage() {
    const columns: Column<AuditObjectBranchNetwork>[] = [
        { key: 'id',          label: 'ID',          sortable: true },
        { key: 'code',        label: 'Code',        sortable: true },
        { key: 'name',        label: 'Name',        sortable: true },
        { key: 'description', label: 'Description', sortable: true},
        { key: 'mfoCode',     label: 'MFO Code',    sortable: true },
        { key: 'status',      label: 'Status',      sortable: true },
        { key: 'auditObjectId', label: 'Audit Object ID', sortable: true },
    ];

    return (
        <Table<AuditObjectBranchNetwork>
            apiUrl={ROUTES.AUDIT_OBJECT_BRANCH_NETWORKS}
            columns={columns}
        />
    );
}