// src/pages/UsersPage.tsx
import Table from '../components/table/Table';
import type { Column } from '../components/table/useTable';
import { ROUTES } from '@/utils/constants';

interface UserType {
    id: number;
    username: string;
    enabled: boolean;
}

export default function UsersPage() {
    const columns: Column<UserType>[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'username', label: 'Username', sortable: true },
        { key: 'enabled', label: 'Enabled', sortable: true },
    ];

    return (
        <Table<UserType>
            apiUrl={ROUTES.USERS}
            columns={columns}
        />
    );
}