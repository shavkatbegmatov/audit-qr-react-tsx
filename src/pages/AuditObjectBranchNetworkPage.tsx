// src/pages/AuditObjectBranchNetworkPage.tsx
import Table from '@/components/table/Table';
import type { Column } from '@/components/table/useTable';
import { ROUTES } from "@/utils/constants.ts";
import {formatDate} from "@/utils/dateUtils.ts";

interface AuditObjectBranchNetwork {
    id: number;
    code: string;
    name: string;
    description: string;
    status: string;
    parentId: number | null;
    mfoCode: string;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
}

export default function AuditObjectBranchNetworkPage() {
    const columns: Column<AuditObjectBranchNetwork>[] = [
        { key: 'id',          label: 'ID',          sortable: true },
        { key: 'code',        label: 'Code',        sortable: true },
        { key: 'name',        label: 'Name',        sortable: true },
        { key: 'description', label: 'Description', sortable: true},
        { key: 'status',      label: 'Status',      sortable: true },
        { key: 'parentId',    label: 'Parent ID (AuditObject)',   sortable: true },
        { key: 'mfoCode',     label: 'MFO Code',    sortable: true },
        { key: 'createdBy',   label: 'Created By',  sortable: true },
        { key: 'createdAt',   label: 'Created At',  sortable: true, render: (value) => formatDate(value) },
        { key: 'updatedBy',   label: 'Updated By',  sortable: true },
        { key: 'updatedAt',   label: 'Updated At',  sortable: true, render: (value) => formatDate(value) },
    ];

    return (
        <Table<AuditObjectBranchNetwork>
            apiUrl={ROUTES.AUDIT_OBJECT_BRANCH_NETWORKS}
            columns={columns}
            parentApiUrl={ROUTES.AUDIT_OBJECTS}
            grandParentApiUrl={ROUTES.AUDIT_OBJECT_TYPES}
            parentDefaultLabel={"Audit obyektlari"}
            grandParentDefaultLabel={"Audit obyekt turlari"}
        />
    );
}