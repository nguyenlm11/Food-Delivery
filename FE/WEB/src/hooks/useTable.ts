import { useCallback, useEffect, useState } from "react"

type TableQuery = {
    currentPage: number
    pageSize: number
    sortBy: string
    sortOrder: "asc" | "desc"
    [key: string]: any
}

export function useTable(fetchData: (params: any) => Promise<any>, initialQuery: TableQuery) {
    const [query, setQuery] = useState<TableQuery>(initialQuery)
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const { currentPage, pageSize, ...rest } = query
        const params = { ...rest, page: currentPage, limit: pageSize }

        const load = async () => {
            try {
                const response = await fetchData(params)
                setData(response)
            }
            catch {
                setData(null)
            }
            finally {
                setIsLoading(false)
            }
        }
        void load()
    }, [fetchData, query, reloadKey])

    const updateQuery = (changes: { [key: string]: any }) => {
        setQuery((current) => ({ ...current, ...changes, currentPage: 1 }))
    }

    const removeFilter = (key: string) => {
        setQuery((current) => ({ ...current, [key]: undefined, currentPage: 1 }))
    }

    const changePage = (page: number) => {
        setQuery((current) => ({ ...current, currentPage: page }))
    }

    const changePageSize = (pageSize: number) => {
        setQuery((current) => ({ ...current, pageSize, currentPage: 1 }))
    }

    const changeSort = (sortKey: string) => {
        setQuery((current) => current.sortBy === sortKey
            ? { ...current, sortOrder: current.sortOrder === "asc" ? "desc" : "asc", currentPage: 1 }
            : { ...current, sortBy: sortKey, sortOrder: "asc", currentPage: 1 })
    }

    const reload = useCallback(() => {
        setReloadKey((current) => current + 1)
    }, [])

    return {
        query,
        updateQuery,
        removeFilter,
        changePage,
        changePageSize,
        changeSort,
        data,
        isLoading,
        reload
    }
}
