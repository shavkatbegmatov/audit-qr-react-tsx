import Table from '../components/table/Table';
import type { Column } from '../components/table/useTable';

interface AuditType {
    id: number;
    code: string;
    name: string;
    status: string;
}

export default function AuditObjectTypesPage() {
    const columns: Column<AuditType>[] = [
        { key: 'id',     label: 'ID',     sortable: true },
        { key: 'code',   label: 'Code',   sortable: true },
        { key: 'name',   label: 'Name',   sortable: true },
        { key: 'status', label: 'Status', sortable: true },
    ];

    return (
        <Table<AuditType>
            apiUrl="http://localhost:8080/api/audit-object-types"
            columns={columns}
        />
    );
}
