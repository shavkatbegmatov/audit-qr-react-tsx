// src/hooks/useParentOptions.ts
import { useState, useEffect } from 'react';
import api from '@/services/api';

interface ParentOption {
    id: number;
    name: string;
    parentId?: number | null;
}

export function useParentOptions(parentApiUrl?: string): ParentOption[] {
    const [parentOptions, setParentOptions] = useState<ParentOption[]>([]);

    useEffect(() => {
        if (parentApiUrl) {
            // Yangi, paginatsiyasiz endpoint'ga so'rov yuboramiz
            const urlForSelect = `${parentApiUrl}/all-for-select`;

            api.get(urlForSelect).then(res => { // <-- O'zgartirilgan URL
                let items;
                // Javob endi paginatsiyasiz bo'lgani uchun "content" bo'lmasligi mumkin
                if (res.data.success && Array.isArray(res.data.data)) {
                    items = res.data.data;
                } else if (res.data.success && res.data.data.content) { // Eski format bilan moslik uchun qoldiramiz
                    items = res.data.data.content;
                } else {
                    items = [];
                }
                setParentOptions(items.map((item: { id: number; name: string; parentId?: number | null }) => ({
                    id: item.id,
                    name: item.name,
                    parentId: item.parentId
                })));
            }).catch(err => console.error(`Failed to fetch parent options from ${urlForSelect}:`, err));
        }
    }, [parentApiUrl]);

    return parentOptions;
}