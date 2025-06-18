// src/components/table/Table.tsx
// src/components/table/Table.tsx
import type {Column} from './useTable';
import useTable from './useTable';
import TableToolbar from './TableToolbar';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TablePagination from './TablePagination';
import styles from './Table.module.css';

interface TableProps<T> {
    apiUrl: string;
    columns: Column<T>[];
}

export default function Table<T extends { id: any }>({ apiUrl, columns }: TableProps<T>) {
    const {
        data, loading, page, total,
        createItem, updateItem, deleteItem,
        onSearch, onFilter, onSort, onPageChange,
        sortKey, sortOrder,
    } = useTable<T>({ apiUrl, columns });

    return (
        <div className={styles.tableWrapper}>
            <TableToolbar
                onSearch={onSearch}
                onFilter={onFilter}
                onCreate={createItem}
            />
            <table className={styles.table}>
                <TableHeader
                    columns={columns}
                    onSort={onSort}
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                />
                <TableBody
                    data={data}
                    columns={columns}
                    onEdit={updateItem}
                    onDelete={deleteItem}
                    loading={loading}
                />
            </table>
            <TablePagination
                page={page}
                total={total}
                pageSize={10}
                onPageChange={onPageChange}
            />
        </div>
    );
}
