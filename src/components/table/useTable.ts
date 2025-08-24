// src/components/table/useTable.ts
import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import React from 'react';

// --- BOSHLANISHI: QAYTA TUZATILGAN QISM ---

// Ma'lumotlar ustunlari uchun tip. `render` funksiyasi `row` parametrini ham qabul qilishi mumkin.
type DataColumn<T> = {
    [K in keyof T]: {
        key: K;
        label: string;
        sortable?: boolean;
        width?: string;
        align?: 'left' | 'center' | 'right';
        render?: (value: T[K], row: T) => React.ReactNode;
    }
}[keyof T];

// Maxsus ustunlar uchun tip (masalan, 'actions').
// `key` har qanday `string` bo'lishi mumkin va `render` funksiyasi butun qatorni (`row`) qabul qilishi shart.
type CustomColumn<T> = {
    key: string;
    label: string;
    sortable?: false;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render: (_value: any, row: T) => React.ReactNode;
};

// Yakuniy 'Column' tipi ikkala ustun turini ham qamrab oladi.
export type Column<T> = DataColumn<T> | CustomColumn<T>;

// --- TUGASHI: QAYTA TUZATILGAN QISM ---

export interface TableParams<T> {
    apiUrl: string;
    pageSize?: number;
    columns: Column<T>[];
}

interface ApiResponse<T> {
    success: boolean;
    data: {
        content?: T[];
    } | T[];
    meta?: {
        totalElements: number;
    };
    error?: unknown;
}

export default function useTable<T extends {
    id: number;
    parentId?: number | null
}>({
       apiUrl,
       pageSize = 10
   }: TableParams<T>) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<Record<string, unknown>>({});
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, unknown> = {
                page: page - 1,
                size: pageSize,
                q: search,
                ...filters,
            };
            if (sortKey) {
                params.sort = `${String(sortKey)},${sortOrder}`;
            }

            const res = await api.get<ApiResponse<T>>(apiUrl, { params });

            let items: T[] = [];
            let totalElements: number = 0;

            if (res.data.success && 'content' in res.data.data && typeof res.data.meta?.totalElements === 'number') {
                items = res.data.data.content ?? [];
                totalElements = res.data.meta.totalElements;
            } else if (res.data.success && Array.isArray(res.data.data)) {
                items = res.data.data;
                totalElements = items.length;
            } else {
                console.error('Unexpected response format:', res.data);
                setData([]);
                setTotal(0);
                return;
            }

            if (sortKey) {
                items = [...items].sort((a, b) => {
                    const aVal = a[sortKey];
                    const bVal = b[sortKey];
                    if (aVal == null) return -1;
                    if (bVal == null) return 1;
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    return sortOrder === 'asc'
                        ? String(aVal).localeCompare(String(bVal))
                        : String(bVal).localeCompare(String(aVal));
                });
            }

            setTotal(totalElements);
            setData(items);
        } catch (err) {
            console.error(err);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, page, pageSize, search, filters, sortKey, sortOrder]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const createItem = async (item: Partial<T>) => {
        await api.post(apiUrl, item);
        await fetchData();
    };

    const updateItem = async (id: number, item: Partial<T>) => {
        await api.put(`${apiUrl}/${id}`, item);
        await fetchData();
    };

    const deleteItem = async (id: number) => {
        await api.delete(`${apiUrl}/${id}`);
        await fetchData();
    };

    const onSearch = (q: string) => { setSearch(q); setPage(1); };
    const onFilter = (f: Record<string, unknown>) => { setFilters(f); setPage(1); };
    const onSort = (key: keyof T) => {
        if (sortKey === key) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortOrder('asc'); }
    };
    const onPageChange = (p: number) => setPage(p);

    return {
        data, loading, page, total,
        createItem, updateItem, deleteItem,
        onSearch, onFilter, onSort, onPageChange,
        sortKey, sortOrder,
    };
}