import { useState } from 'react';
import type { Column } from './useTable';
import useTable from './useTable';
import TableToolbar from './TableToolbar';
import TableHeader  from './TableHeader';
import TableBody    from './TableBody';
import TablePagination from './TablePagination';
import CreateModal  from './CreateModal';

interface TableProps<T> {
    apiUrl: string;
    columns: Column<T>[];
}

export default function Table<T extends { id: any }>({ apiUrl, columns }: TableProps<T>) {
    const {
        data, loading, page, total,
        createItem, updateItem, deleteItem,
        onSearch, onFilter, onSort, onPageChange,
        sortKey, sortOrder
    } = useTable<T>({ apiUrl, columns });

    const [showCreate, setShowCreate] = useState(false);
    const openCreate  = () => setShowCreate(true);
    const closeCreate = () => setShowCreate(false);
    const handleCreate = async (item: Partial<T>) => { await createItem(item); closeCreate(); };

    return (
        <div className="bg-white border border-gray-200 rounded shadow overflow-hidden">
            <TableToolbar onSearch={onSearch} onFilter={onFilter} onOpenCreate={openCreate} />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <TableHeader columns={columns} onSort={onSort} sortKey={sortKey} sortOrder={sortOrder} />
                    <TableBody data={data} columns={columns} onEdit={updateItem} onDelete={deleteItem} loading={loading} />
                </table>
            </div>
            <TablePagination page={page} total={total} pageSize={10} onPageChange={onPageChange} />
            <CreateModal visible={showCreate} onSubmit={handleCreate} onClose={closeCreate} columns={columns} />
        </div>
    );
}
