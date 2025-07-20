// src/pages/RolesPage.tsx
import Table from '@/components/table/Table';
import type { Column } from '@/components/table/useTable';
import { ROUTES } from "@/utils/constants.ts";

interface RoleType {
    id: number;
    name: string;
}

export default function RolesPage() {
    const columns: Column<RoleType>[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
    ];

    return (
        <Table<RoleType>
            apiUrl={ROUTES.ROLES}
            columns={columns}
        />
    );
}