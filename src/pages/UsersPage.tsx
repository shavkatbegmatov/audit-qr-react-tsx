// src/pages/UsersPage.tsx
import { useMemo } from 'react';
// `Maps` olib tashlandi, chunki ishlatilmaydi
// import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';

// Asosiy komponentlar
import Table from '@/components/table/Table';
import type { Column as BaseColumn } from '@/components/table/useTable';
import Badge from '@/components/ui/Badge';
import UiButton from '@/components/ui/UiButton';

// Tiplarni import qilish
import type { User, UserRole } from '@/types/UserTypes';

// Yordamchi funksiyalar va konstantalar
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/dateUtils';

export default function UsersPage() {
    // navigate o'zgaruvchisi e'lon qilinmadi

    const columns: BaseColumn<User>[] = useMemo(
        () => [
            { key: 'id', label: 'ID', sortable: true, width: '80px' },
            {
                key: 'fullName',
                label: 'To\'liq Ism',
                sortable: true,
                render: (value: User['fullName'], row: User) => (
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{value ?? row.username}</span>
                    </div>
                ),
            },
            { key: 'username', label: 'Login', sortable: true },
            {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (value: User['status']) => (
                    <Badge variant={value === 'ACTIVE' ? 'success' : 'danger'}>{value}</Badge>
                ),
            },
            {
                key: 'enabled',
                label: 'Aktiv',
                sortable: true,
                render: (value: User['enabled']) => (
                    <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Ha' : 'Yo\'q'}</Badge>
                ),
            },
            {
                key: 'roles',
                label: 'Rollar',
                render: (value: UserRole[]) =>
                    value?.map((role: UserRole) => <Badge key={role.id} variant="info">{role.name}</Badge>) ?? '—',
            },
            {
                key: 'createdAt',
                label: 'Yaratilgan Vaqti',
                sortable: true,
                render: (value: string) => (value ? formatDate(value, true) : '—'),
            },
            {
                key: 'actions',
                label: 'Harakatlar',
                align: 'center',
                width: '120px',
                render: (_: any, row: User) => (
                    <div className="flex justify-center gap-2">
                        <UiButton
                            variant="icon"
                            size="sm"
                            onClick={() => console.warn(`Tahrirlash: ${row.id}`)}
                            title="Tahrirlash"
                        >
                            <FaEdit />
                        </UiButton>
                        <UiButton
                            variant="icon"
                            size="sm"
                            color="danger"
                            onClick={() => console.warn(`O'chirish: ${row.id}`)}
                            title="O'chirish"
                        >
                            <FaTrashAlt />
                        </UiButton>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="p-4 space-y-4">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Foydalanuvchilar Boshqaruvi</h1>
                <UiButton
                    variant="primary"
                    onClick={() => console.warn('Yangi foydalanuvchi qo\'shish oynasi ochilishi kerak')}
                >
                    <FaPlus className="mr-2" />
                    Yangi foydalanuvchi qo'shish
                </UiButton>
            </header>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table<User>
                    apiUrl={ROUTES.USERS}
                    columns={columns}
                />
            </div>
        </div>
    );
}