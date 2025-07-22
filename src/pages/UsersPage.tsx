// src/pages/UsersPage.tsx
import Table from '../components/table/Table';
import type { Column } from '../components/table/useTable';
import { ROUTES } from '@/utils/constants';

// API javobiga mos interfeys
interface RoleType {
    id: number;
    name: string;
    description: string | null;
    status: string;
    createdBy: string | null;
    createdAt: string | null;
    updatedBy: string | null;
    updatedAt: string | null;
}

interface UserType {
    id: number;
    username: string;
    fullName: string | null;
    description: string | null;
    enabled: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    roles: RoleType[];
}

export default function UsersPage() {
    const columns: Column<UserType>[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'username', label: 'Username', sortable: true },
        { key: 'fullName', label: 'Full Name', sortable: true, render: (user) => user.fullName ?? 'N/A' },
        { key: 'enabled', label: 'Enabled', sortable: true, render: (user) => (user.enabled ? 'Yes' : 'No') },
        { key: 'status', label: 'Status', sortable: true },
        {
            key: 'roles',
            label: 'Roles',
            sortable: false,
            render: (user) => user.roles?.map((role) => role.name).join(', ') || 'No roles',
        },
        {
            key: 'createdAt',
            label: 'Created At',
            sortable: true,
            render: (user) => new Date(user.createdAt).toLocaleString() || 'N/A',
        },
    ];

    return (
        <Table<UserType>
            apiUrl={ROUTES.USERS}
            columns={columns}
            // Agar Table komponenti meta ma'lumotlarni qo'llab-quvvatlasa
            pagination={{
                pageSize: 10,
                currentPage: 0,
            }}
        />
    );
}