import type { Column } from './useTable';

interface HeaderProps<T> {
    columns: Column<T>[];
    onSort: (key: keyof T) => void;
    sortKey: keyof T | null;
    sortOrder: 'asc'|'desc';
}

export default function TableHeader<T>({
                                           columns, onSort, sortKey, sortOrder
                                       }: HeaderProps<T>) {
    return (
        <thead className="bg-gray-50">
        <tr>
            {columns.map(col => (
                <th
                    key={String(col.key)}
                    onClick={() => col.sortable && onSort(col.key)}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer' : ''}`}
                >
                    <div className="flex items-center">
                        {col.label}
                        {sortKey === col.key && (
                            <span className="ml-1 text-sm">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                    </div>
                </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
            </th>
        </tr>
        </thead>
    );
}
