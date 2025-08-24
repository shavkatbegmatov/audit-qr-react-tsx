// src/pages/AuditObjectTypesPage.tsx
import { useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';

// Asosiy komponentlar
import Table from '@/components/table/Table';
import type { Column as BaseColumn } from '@/components/table/useTable';
import Badge from '@/components/ui/Badge';
import UiButton from '@/components/ui/UiButton';

// Tiplarni import qilish
import type { AuditObjectType, AuditObjectStatus } from '@/types/AuditObjectTypes';

// Yordamchi funksiyalar va konstantalar
import { ROUTES } from "@/utils/constants.ts";
import { formatDate } from "@/utils/dateUtils.ts";

// Status uchun Badge rangini aniqlovchi funksiya
const getStatusBadgeVariant = (status: AuditObjectStatus) => {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'INACTIVE': return 'danger';
        case 'DRAFT': return 'secondary';
        default: return 'secondary';
    }
};

export default function AuditObjectTypesPage() {
    // Ustunlarni 'useMemo' bilan optimallashtiramiz
    const columns: BaseColumn<AuditObjectType>[] = useMemo(() => [
        { key: 'id',          label: 'ID',          sortable: true },
        { key: 'code',        label: 'Kod',         sortable: true },
        { key: 'name',        label: 'Nomi',        sortable: true },
        { key: 'description', label: 'Tavsifi',     sortable: true },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>
            )
        },
        { key: 'parentId',    label: 'Parent ID',   sortable: true },
        {
            key: 'createdAt',
            label: 'Yaratilgan Vaqti',
            sortable: true,
            render: (value) => (value ? formatDate(value, true) : '—')
        },
        {
            key: 'updatedAt',
            label: 'Yangilangan Vaqti',
            sortable: true,
            render: (value) => (value ? formatDate(value, true) : '—')
        },
    ], []);

    return (
        <div className="p-4 space-y-4">
            {/* Sahifa sarlavhasi va "Yangi qo'shish" tugmasi */}
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Audit Obyekt Turlari</h1>
                <UiButton
                    variant="primary"
                    onClick={() => console.warn('Yangi audit obyekti turini qo\'shish oynasi ochilishi kerak')}
                >
                    <FaPlus className="mr-2" />
                    Yangi qo'shish
                </UiButton>
            </header>

            {/* Ma'lumotlar jadvali */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table<AuditObjectType>
                    apiUrl={ROUTES.AUDIT_OBJECT_TYPES}
                    columns={columns}
                    // Ota-ona elementlar uchun filtrlar (agar kerak bo'lsa)
                    // parentApiUrl="/api/v1/some-parent-api"
                    // parentDefaultLabel="Parent"
                />
            </div>
        </div>
    );
}