import { useEffect, useState, useCallback } from 'react'
import socket from '@/services/core/socket'

interface UseApiListResult<Q, T> {
  data: T[] | null
  pagination: any | null
  isLoading: boolean
  query: Q
  setQuery: (updater: Q | ((prev: Q) => Q)) => void
  reload: () => void
}

export function useApiList<Q extends object, T = any>(
  fetcher: (query: Q) => Promise<{ data: { [key: string]: T[], pagination: any } }>,
  socketEvents: string[],
  initialQuery?: Q
): UseApiListResult<Q, T> {
  const [query, setQueryState] = useState<Q>(initialQuery || ({} as Q))
  const [data, setData] = useState<T[] | null>(null)
  const [pagination, setPagination] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const setQuery = useCallback((updater: Q | ((prev: Q) => Q)) => {
    setQueryState((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }, [])

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const response = await fetcher(query)
        const entities = Object.values(response.data).find(Array.isArray) as T[]
        const paginationMeta = response.data.pagination
        setData(entities || [])
        setPagination(paginationMeta)
      } catch (error) {
        console.error('[useApiList] fetch error:', error)
        setData(null)
        setPagination(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [query, reloadKey, fetcher])

  useEffect(() => {
    const handleReload = () => setReloadKey((k) => k + 1)

    socketEvents.forEach((event) => socket.on(event, handleReload))

    return () => {
      socketEvents.forEach((event) => socket.off(event, handleReload))
    }
  }, [socketEvents])

  return { data, pagination, isLoading, query, setQuery, reload }
}
