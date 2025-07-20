// src/components/table/TableToolbar.tsx
// Jadval ustidagi toolbar: Qidirish inputi, Filter va Create tugmalari.
// O'zgartirish: Tugmalarni universal Button komponentiga almashtirdik.
// Filter: secondary variant (gray), Create: primary variant (blue).

import { useState } from 'react';
import Button from '@/components/ui/Button';  // Universal Button import qilindi

interface TableToolbarProps {
    onSearch: (q: string) => void;
    onFilter: (f: Record<string, unknown>) => void;  // any o'rniga unknown
    onOpenCreate: () => void;
}

export default function TableToolbar({ onSearch, onFilter, onOpenCreate }: TableToolbarProps) {
    const [q, setQ] = useState('');

    return (
        <div className="flex items-center p-4 bg-gray-100 border-b border-gray-200 space-x-2">
            <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Qidirish..."
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyUp={e => e.key === 'Enter' && onSearch(q)}
            />
            <Button
                variant="secondary"  // Gray stillar
                onClick={() => onFilter({})}
            >
                Filter
            </Button>
            <Button
                variant="primary"  // Blue stillar
                onClick={onOpenCreate}
            >
                Create
            </Button>
        </div>
    );
}