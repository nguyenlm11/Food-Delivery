import { useCallback, useEffect, useState } from "react"
import socket from "@/services/core/socket"

interface UseTableQueryParams {
    fetcher: (query: any) => Promise<any>
    getItems: (response: any) => any[]
    socketEvents: string[]
    initialQuery?: any
    onError?: (error: any) => void
}

function useApiList({ fetcher, getItems, socketEvents, initialQuery, onError }: UseTableQueryParams) {
    const [query, setQuery] = useState<any>(initialQuery ?? { limit: 10, page: 1 })
    const [items, setItems] = useState<any[]>([])
    const [pagination, setPagination] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchInput, setSearchInput] = useState("")
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                const response = await fetcher(query)
                setItems(getItems(response) ?? [])
                setPagination(response?.data?.pagination ?? null)
            }
            catch (error) {
                setItems([])
                setPagination(null)
                onError?.(error)
            }
            finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [query, reloadKey])

    useEffect(() => {
        const handleReload = () => setReloadKey((current) => current + 1)

        socketEvents.forEach((event) => socket.on(event, handleReload))

        return () => {
            socketEvents.forEach((event) => socket.off(event, handleReload))
        }
    }, [socketEvents.join(",")])

    const handleSort = useCallback((sortKey: string) => {
        setQuery((current: any) => ({
            ...current,
            sortBy: sortKey,
            sortOrder: current.sortBy === sortKey ? (current.sortOrder === "asc" ? "desc" : "asc") : "asc",
            page: 1
        }))
    }, [])

    const handleSearch = useCallback(() => {
        setQuery((current: any) => ({
            ...current,
            search: searchInput.trim(),
            page: 1
        }))
    }, [searchInput])

    const handlePageChange = useCallback((page: number) => {
        setQuery((current: any) => ({ ...current, page }))
    }, [])

    const handlePageSizeChange = useCallback((limit: number) => {
        setQuery((current: any) => ({ ...current, limit, page: 1 }))
    }, [])

    return {
        items,
        pagination,
        isLoading,
        query,
        setQuery,
        searchInput,
        setSearchInput,
        handleSort,
        handleSearch,
        handlePageChange,
        handlePageSizeChange,
    }
}

export default useApiList