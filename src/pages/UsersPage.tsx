// src/pages/UsersPage.tsx
import Table from '@/components/table/Table';
import type { Column as BaseColumn } from '@/components/table/useTable';
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/dateUtils';

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
    firstName: string | null;
    lastName: string | null;
    middleName: string | null;
    hrEmpsId: number | null;
    description: string | null;
    enabled: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    roles: RoleType[];
}

type Column<T> = BaseColumn<T>;

export default function UsersPage() {
    const columns: Column<UserType>[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'username', label: 'Username', sortable: true },
        { key: 'fullName', label: 'Full Name', sortable: true, render: (value) => value ?? 'N/A' },
        // { key: 'firstName', label: 'First Name', sortable: true, render: (value) => value ?? 'N/A' },
        // { key: 'lastName', label: 'Last Name', sortable: true, render: (value) => value ?? 'N/A' },
        // { key: 'middleName', label: 'Middle Name', sortable: true, render: (value) => value ?? 'N/A' },
        { key: 'hrEmpsId', label: 'HR Emps ID', sortable: true, render: (value) => value?.toString() ?? 'N/A' },
        // { key: 'enabled', label: 'Enabled', sortable: true, render: (value) => (value ? 'Yes' : 'No') },
        { key: 'status', label: 'Status', sortable: true },
        {
            key: 'roles',
            label: 'Roles',
            sortable: false,
            render: (value) => value?.map((role: RoleType) => role.name).join(', ') || 'No roles',
        },
        {
            key: 'createdAt',
            label: 'Created At',
            sortable: true,
            render: (value) => formatDate(value, true) || 'N/A',
        },
    ];

    return (
        <Table<UserType>
            apiUrl={ROUTES.USERS}
            columns={columns}
        />
    );
}