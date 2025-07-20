// src/components/table/Table.tsx
import { useState } from 'react';
import type { Column } from './useTable';
import useTable from './useTable';
import TableToolbar from './TableToolbar';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TablePagination from './TablePagination';
import CreateModal from './CreateModal';
import EditModal from './EditModal';
// 1-QADAM: ConfirmModal komponentini import qilish
import ConfirmModal from '@/components/layout/ConfirmModal'; // Yo'lni o'zingizning loyihadagiga moslang

interface TableProps<T extends { id: number }> {
    apiUrl: string;
    columns: Column<T>[];
}

export default function Table<T extends { id: number }>({ apiUrl, columns }: TableProps<T>) {
    const {
        data, loading, page, total,
        createItem, updateItem, deleteItem, // Asl `deleteItem` funksiyasi shu yerda
        onSearch, onFilter, onSort, onPageChange,
        sortKey, sortOrder
    } = useTable<T>({ apiUrl, pageSize: 10, columns });

    const [showCreate, setShowCreate] = useState(false);
    const [editItem, setEditItem] = useState<Partial<T> | null>(null);

    // 2-QADAM: O'chirishni tasdiqlash uchun kerakli state'larni qo'shish
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false); // Modal ichidagi yuklanish holati uchun

    const openCreate = () => setShowCreate(true);
    const closeCreate = () => setShowCreate(false);
    const handleCreate = async (item: Partial<T>) => {
        await createItem(item);
        closeCreate();
    };

    const openEdit = (item: T) => setEditItem(item);
    const closeEdit = () => setEditItem(null);
    const handleEdit = async (updated: Partial<T>) => {
        if (updated.id) {
            await updateItem(updated.id, updated);
        }
        closeEdit();
    };

    // 3-QADAM: O'chirish jarayonini boshqaruvchi funksiyalar

    // Bu funksiya TableRow'dagi "Delete" tugmasi bosilganda ishlaydi
    const handleDeleteRequest = (id: number) => {
        setItemToDelete(id); // Qaysi ID o'chirilishini eslab qolamiz
        setIsConfirmModalOpen(true); // Tasdiq modalini ochamiz
    };

    // Bu funksiya modal oynadagi "Confirm" tugmasi bosilganda ishlaydi
    const handleConfirmDelete = async () => {
        if (itemToDelete !== null) {
            setIsDeleting(true);
            await deleteItem(itemToDelete); // `useTable` hook'idagi asl o'chirish funksiyasini chaqiramiz
            setIsDeleting(false);
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    // Bu funksiya modal oynadagi "Cancel" tugmasi bosilganda ishlaydi
    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className="bg-white border border-gray-200 rounded shadow overflow-hidden">
            <TableToolbar onSearch={onSearch} onFilter={onFilter} onOpenCreate={openCreate} />
            <TablePagination page={page} total={total} pageSize={10} onPageChange={onPageChange} />

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <TableHeader columns={columns} onSort={onSort} sortKey={sortKey} sortOrder={sortOrder} />
                    {/* 4-QADAM: TableBody ga `deleteItem` o'rniga `handleDeleteRequest`ni uzatish */}
                    <TableBody data={data} columns={columns} onEdit={openEdit} onDelete={handleDeleteRequest} loading={loading} />
                </table>
            </div>

            {/* Mavjud modallar */}
            <CreateModal visible={showCreate} onSubmit={handleCreate} onClose={closeCreate} columns={columns} />
            <EditModal visible={!!editItem} item={editItem} onSubmit={handleEdit} onClose={closeEdit} columns={columns} />

            {/* 5-QADAM: ConfirmModal komponentini render qilish va unga kerakli props'larni berish */}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isLoading={isDeleting}
                title="O'chirishni tasdiqlash"
                message="Haqiqatan ham ushbu elementni o'chirmoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi."
            />
        </div>
    );
}