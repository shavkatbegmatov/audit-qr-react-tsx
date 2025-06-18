// src/components/table/useTable.ts
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export interface Column<T> {
    key: keyof T
    label: string
    sortable?: boolean
}

export interface TableParams<T> {
    apiUrl: string
    pageSize?: number
}

export default function useTable<T>({
                                        apiUrl,
                                        pageSize = 10
                                    }: TableParams<T>) {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState<Record<string, any>>({})
    const [sortKey, setSortKey] = useState<keyof T | null>(null)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            // server so‘rovini yuboramiz (agar servertagilarni ham o‘tkazmoqchi bo‘lsangiz)
            const params: any = {
                page: page - 1,       // Spring Boot Pageable: zero-based
                size: pageSize,
                q: search,
                ...filters,
            }
            // Agar Spring Boot REST – sort param: sort=field,asc
            if (sortKey) {
                params.sort = `${String(sortKey)},${sortOrder}`
            }

            const res = await axios.get<any>(apiUrl, { params })
            // Agar Spring paged response bo‘lsa:
            if (res.data.content && typeof res.data.totalElements === 'number') {
                let items: T[] = res.data.content

                // **Mijoz tomonida ham sort**
                if (sortKey) {
                    items = [...items].sort((a, b) => {
                        const aVal = a[sortKey], bVal = b[sortKey]
                        if (aVal == null) return -1
                        if (bVal == null) return 1
                        if (typeof aVal === 'number' && typeof bVal === 'number') {
                            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
                        }
                        return sortOrder === 'asc'
                            ? String(aVal).localeCompare(String(bVal))
                            : String(bVal).localeCompare(String(aVal))
                    })
                }

                setTotal(res.data.totalElements)
                setData(items)
            } else {
                // Fallback: oddiy ro‘yxat
                let items: T[] = res.data
                if (sortKey) {
                    items = [...items].sort((a, b) => {
                        const aVal = a[sortKey], bVal = b[sortKey]
                        if (aVal == null) return -1
                        if (bVal == null) return 1
                        if (typeof aVal === 'number' && typeof bVal === 'number') {
                            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
                        }
                        return sortOrder === 'asc'
                            ? String(aVal).localeCompare(String(bVal))
                            : String(bVal).localeCompare(String(aVal))
                    })
                }
                setTotal(items.length)
                setData(items)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [apiUrl, page, pageSize, search, filters, sortKey, sortOrder])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // CRUD ops
    const createItem  = async (item: Partial<T>) => { await axios.post(apiUrl, item); fetchData() }
    const updateItem  = async (id: any, item: Partial<T>) => { await axios.put(`${apiUrl}/${id}`, item); fetchData() }
    const deleteItem  = async (id: any) => { await axios.delete(`${apiUrl}/${id}`); fetchData() }

    // Handlers
    const onSearch     = (q: string) => { setSearch(q); setPage(1) }
    const onFilter     = (f: Record<string, any>) => { setFilters(f); setPage(1) }
    const onSort       = (key: keyof T) => {
        if (sortKey === key) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
        else { setSortKey(key); setSortOrder('asc') }
    }
    const onPageChange = (p: number) => setPage(p)

    return {
        data, loading, page, total,
        createItem, updateItem, deleteItem,
        onSearch, onFilter, onSort, onPageChange,
        sortKey, sortOrder,
    }
}
