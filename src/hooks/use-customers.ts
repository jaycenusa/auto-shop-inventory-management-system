import { useCallback, useEffect, useMemo, useState } from 'react'
import { customerService } from '../service/customer-service'
import type { Customer } from '../types/customer'

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export type UseCustomersOptions = {
  /**
   * When set, fetches `/api/customers` for this key.
   * Pass the active view so each customers-tab visit triggers a request.
   * Pass `null` to skip fetching.
   */
  requestKey?: string | null
}

export function useCustomers({
  requestKey = 'default',
}: UseCustomersOptions = {}) {
  const [data, setData] = useState<Customer[]>([])
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
        const result = await customerService.list()
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

  const customers = useMemo(() => data, [data])

  const reload = useCallback(() => {
    setReloadToken(t => t + 1)
  }, [])

  return { customers, loading, error, reload }
}
