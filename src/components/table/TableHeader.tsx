// src/components/table/TableHeader.tsx
// src/components/table/TableHeader.tsx
import type {Column} from './useTable';
import styles from './Table.module.css';

interface HeaderProps<T> {
    columns: Column<T>[];
    onSort: (key: keyof T) => void;
    sortKey: keyof T | null;
    sortOrder: 'asc'|'desc';
}

export default function TableHeader<T>({ columns, onSort, sortKey, sortOrder }: HeaderProps<T>) {
    return (
        <thead>
        <tr>
            {columns.map(col => (
                <th
                    key={String(col.key)}
                    onClick={() => col.sortable && onSort(col.key)}
                    className={col.sortable ? styles.sortable : ''}
                >
                    {col.label}
                    {sortKey === col.key && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
            ))}
            <th>Actions</th>
        </tr>
        </thead>
    );
}
