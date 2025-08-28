// src/components/table/TableToolbar.tsx
import React, { useState } from 'react';
import UiButton from '@/components/ui/UiButton'; // UiButton'dan foydalanamiz
import { useParentOptions } from '@/hooks/useParentOptions';
import { FaPlus, FaSearch } from 'react-icons/fa'; // Ikonkalar qo'shamiz

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

    const handleFilterChange = (grandId: string, parentId: string) => {
        onFilter({
            grandParentId: grandId ? parseInt(grandId, 10) : undefined,
            parentId: parentId ? parseInt(parentId, 10) : undefined,
        });
    };

    const handleGrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        let newParentValue = selectedParent;
        setSelectedGrand(value);
        if (value && selectedParent && filteredParentOptions.find(opt => opt.id === parseInt(selectedParent)) === undefined) {
            setSelectedParent('');
            newParentValue = '';
        }
        handleFilterChange(value, newParentValue);
    };

    const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParent(value);
        handleFilterChange(selectedGrand, value);
    };

    return (
        <div className="p-4 bg-white border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            {/* Chap tomon: Qidiruv va filtrlar */}
            <div className="flex-1 min-w-0 flex items-center gap-4">
                {/* Qidiruv maydoni */}
                <div className="relative flex-1 md:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="Qidirish..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        onKeyUp={e => e.key === 'Enter' && onSearch(q)}
                    />
                </div>
                {/* Filtrlar */}
                {grandParentApiUrl && (
                    <select
                        className="py-2 pl-3 pr-8 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={selectedGrand}
                        onChange={handleGrandChange}
                    >
                        <option value="">{grandParentDefaultLabel || 'Barchasi'}</option>
                        {grandOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                )}
                {parentApiUrl && (
                    <select
                        className="py-2 pl-3 pr-8 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={selectedParent}
                        onChange={handleParentChange}
                    >
                        <option value="">{parentDefaultLabel || 'Barchasi'}</option>
                        {filteredParentOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                )}
            </div>

            {/* O'ng tomon: Asosiy tugma */}
            <div className="mt-4 sm:mt-0 sm:ml-4">
                <UiButton
                    variant="primary"
                    size="md"
                    onClick={onOpenCreate}
                >
                    <FaPlus className="mr-2 -ml-1" />
                    Yaratish
                </UiButton>
            </div>
        </div>
    );
}