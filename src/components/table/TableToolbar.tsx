// src/components/table/TableToolbar.tsx
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useParentOptions } from '@/hooks/useParentOptions';

interface TableToolbarProps {
    onSearch: (q: string) => void;
    onFilter: (f: Record<string, unknown>) => void;
    onOpenCreate: () => void;
    parentApiUrl?: string;
    grandParentApiUrl?: string;
    parentDefaultLabel?: string;
    grandParentDefaultLabel?: string;
}

export default function TableToolbar({
    onSearch,
    onFilter,
    onOpenCreate,
    parentApiUrl,
    grandParentApiUrl,
    parentDefaultLabel,
    grandParentDefaultLabel
}: TableToolbarProps) {
    const [q, setQ] = useState('');
    const [selectedGrand, setSelectedGrand] = useState('');
    const [selectedParent, setSelectedParent] = useState('');

    const grandOptions = useParentOptions(grandParentApiUrl);
    const parentOptionsAll = useParentOptions(parentApiUrl);

    const filteredParentOptions = selectedGrand ? parentOptionsAll.filter(opt => opt.parentId === parseInt(selectedGrand)) : parentOptionsAll;

    const handleGrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedGrand(value);
        if (value && selectedParent && filteredParentOptions.find(opt => opt.id === parseInt(selectedParent)) === undefined) {
            setSelectedParent('');
        }
        onFilter({
            grandParentId: value ? parseInt(value, 10) : undefined,
            parentId: selectedParent ? parseInt(selectedParent, 10) : undefined
        });
    };

    const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParent(value);
        onFilter({
            grandParentId: selectedGrand ? parseInt(selectedGrand, 10) : undefined,
            parentId: value ? parseInt(value, 10) : undefined
        });
    };

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
            {grandParentApiUrl && (
                <select
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                    value={selectedGrand}
                    onChange={handleGrandChange}
                >
                    <option value="">
                        {grandParentDefaultLabel ? `${grandParentDefaultLabel}: Barchasi` : 'Barchasi'}
                    </option>
                    {grandOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
            )}
            {parentApiUrl && (
                <select
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                    value={selectedParent}
                    onChange={handleParentChange}
                >
                    <option value="">
                        {parentDefaultLabel ? `${parentDefaultLabel}: Barchasi` : 'Barchasi'}
                    </option>
                    {filteredParentOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
            )}
            <Button
                variant="secondary"
                onClick={() => onFilter({})}
            >
                Filter
            </Button>
            <Button
                variant="primary"
                onClick={onOpenCreate}
            >
                Yaratish
            </Button>
        </div>
    );
}