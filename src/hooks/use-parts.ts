import { useCallback, useEffect, useMemo, useState } from 'react'
import { partService } from '../service/part-service'
import type { Part, PartRequest } from '../types/part'

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export type UsePartsOptions = {
  /**
   * When set, fetches `/api/parts` for this key.
   * Pass the active view (or mode) so each tab visit triggers a request.
   * Pass `null` to skip fetching.
   */
  requestKey?: string | null
}

export function useParts({ requestKey = 'default' }: UsePartsOptions = {}) {
  const [data, setData] = useState<Part[]>([])
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
        const result = await partService.list()
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

  const parts = useMemo(() => data, [data])

  const reload = useCallback(() => {
    setReloadToken(t => t + 1)
  }, [])

  const create = useCallback(async (request: PartRequest) => {
    const created = await partService.create(request)
    setData(prev => [...prev, created])
    return created
  }, [])

  const update = useCallback(async (id: string, request: PartRequest) => {
    const updated = await partService.update(id, request)
    setData(prev => prev.map(p => (p.id === id ? updated : p)))
    return updated
  }, [])

  return { parts, loading, error, reload, create, update }
}
