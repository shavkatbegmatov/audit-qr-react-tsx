// src/components/table/TableRow.tsx
// src/components/table/TableRow.tsx
import type {Column} from './useTable';
import styles from './Table.module.css';

interface RowProps<T> {
    item: T;
    columns: Column<T>[];
    onEdit: (id: any, item: Partial<T>) => void;
    onDelete: (id: any) => void;
}

export default function TableRow<T>({ item, columns, onEdit, onDelete }: RowProps<T>) {
    return (
        <tr>
            {columns.map(col => (
                <td key={String(col.key)}>
                    {String(item[col.key])}
                </td>
            ))}
            <td className={styles.actions}>
                <button onClick={() => onEdit(item.id, item)}>✏️</button>
                <button onClick={() => onDelete(item.id)}>🗑️</button>
            </td>
        </tr>
    );
}