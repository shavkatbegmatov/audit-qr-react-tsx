// src/pages/AuditObjectPage.tsx
import Table from '@/components/table/Table';
import type { Column } from '@/components/table/useTable';
import { ROUTES } from "@/utils/constants.ts";
import {formatDate} from "@/utils/dateUtils.ts";

interface AuditObject {
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

export default function AuditObjectPage() {
    const columns: Column<AuditObject>[] = [
        { key: 'id',          label: 'ID',          sortable: true },
        { key: 'code',        label: 'Code',        sortable: true },
        { key: 'name',        label: 'Name',        sortable: true },
        { key: 'description', label: 'Description', sortable: true},
        { key: 'status',      label: 'Status',      sortable: true },
        { key: 'parentId',    label: 'Parent ID (AuditObjectTypes)',   sortable: true },
        { key: 'createdBy',   label: 'Created By',  sortable: true },
        { key: 'createdAt',   label: 'Created At',  sortable: true, render: (value) => formatDate(value) },
        { key: 'updatedBy',   label: 'Updated By',  sortable: true },
        { key: 'updatedAt',   label: 'Updated At',  sortable: true, render: (value) => formatDate(value) },
    ];

    return (
        <Table<AuditObject>
            apiUrl={ROUTES.AUDIT_OBJECTS}
            columns={columns}
            parentApiUrl={ROUTES.AUDIT_OBJECT_TYPES}
            parentDefaultLabel={"Audit obyekt turlari"} // "Audit Object Types: Barchasi"
        />
    );
}