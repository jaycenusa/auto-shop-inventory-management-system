import { useCallback, useEffect, useMemo, useState } from 'react'
import { reorderService } from '../service/reorder-service'
import type {
  ReorderEntry,
  ReorderRequest,
  ReorderStatus,
} from '../types/reorder-entry'

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export type UseReordersOptions = {
  /**
   * When set, fetches `/api/reorders` for this key.
   * Pass the active view so each reorders-tab visit triggers a request.
   * Pass `null` to skip fetching.
   */
  requestKey?: string | null
}

export function useReorders({
  requestKey = 'default',
}: UseReordersOptions = {}) {
  const [data, setData] = useState<ReorderEntry[]>([])
  const [loading, setLoading] = useState(requestKey != null)
  const [error, setError] = useState<Error | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (requestKey == null) {
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await reorderService.list()
        if (!cancelled) setData(result)
      } catch (e) {
        if (!cancelled) {
          setError(toError(e))
          setData([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [requestKey, reloadToken])

  const reorders = useMemo(() => data, [data])

  const reload = useCallback(() => {
    setReloadToken(t => t + 1)
  }, [])

  const create = useCallback(async (request: ReorderRequest) => {
    const created = await reorderService.create(request)
    setData(prev => [created, ...prev])
    return created
  }, [])

  const updateStatus = useCallback(
    async (id: string, status: ReorderStatus) => {
      const updated = await reorderService.updateStatus(id, { status })
      setData(prev => prev.map(r => (r.id === id ? updated : r)))
      return updated
    },
    [],
  )

  return { reorders, loading, error, reload, create, updateStatus }
}
