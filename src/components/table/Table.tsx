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
import ConfirmModal from '@/components/layout/ConfirmModal';

interface TableProps<T extends { id: number }> {
    apiUrl: string;
    columns: Column<T>[];
    parentApiUrl?: string;
    grandParentApiUrl?: string;
    parentDefaultLabel?: string;
    grandParentDefaultLabel?: string;
}

export default function Table<T extends { id: number }>({
    apiUrl,
    columns,
    parentApiUrl,
    grandParentApiUrl,
    parentDefaultLabel,
    grandParentDefaultLabel
}: TableProps<T>) {
    const {
        data, loading, page, total,
        createItem, updateItem, deleteItem,
        onSearch, onFilter, onSort, onPageChange,
        sortKey, sortOrder
    } = useTable<T>({ apiUrl, pageSize: 10, columns });

    const [showCreate, setShowCreate] = useState(false);
    const [editItem, setEditItem] = useState<Partial<T> | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteRequest = (id: number) => {
        setItemToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (itemToDelete !== null) {
            setIsDeleting(true);
            await deleteItem(itemToDelete);
            setIsDeleting(false);
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className="bg-white border border-gray-200 rounded shadow overflow-hidden">
            <TableToolbar
                onSearch={onSearch}
                onFilter={onFilter}
                onOpenCreate={openCreate}
                parentApiUrl={parentApiUrl}
                grandParentApiUrl={grandParentApiUrl}
                parentDefaultLabel={parentDefaultLabel}
                grandParentDefaultLabel={grandParentDefaultLabel}
            />
            <TablePagination page={page} total={total} pageSize={10} onPageChange={onPageChange} />

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <TableHeader columns={columns} onSort={onSort} sortKey={sortKey} sortOrder={sortOrder} />
                    <TableBody data={data} columns={columns} onEdit={openEdit} onDelete={handleDeleteRequest} loading={loading} />
                </table>
            </div>

            <CreateModal visible={showCreate} onSubmit={handleCreate} onClose={closeCreate} columns={columns} parentApiUrl={parentApiUrl} grandParentApiUrl={grandParentApiUrl} />
            <EditModal visible={!!editItem} item={editItem} onSubmit={handleEdit} onClose={closeEdit} columns={columns} parentApiUrl={parentApiUrl} grandParentApiUrl={grandParentApiUrl} />

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