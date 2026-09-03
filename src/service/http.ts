import { DEFAULT_API_BASE_URL } from '../constant/api'

export type ApiFetchOptions = RequestInit & {
  /** Prefix for error messages, e.g. "PartService". */
  serviceName?: string
}

/**
 * JSON fetch against an absolute URL, for third-party hosts such as NHTSA.
 * Sets a JSON content-type for bodies and throws on a non-ok response.
 */
export async function externalJsonFetch<T>(
  url: string,
  init: ApiFetchOptions = {},
): Promise<T> {
  const { serviceName = 'API', ...requestInit } = init
  const headers = new Headers(requestInit.headers)
  if (requestInit.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...requestInit,
    headers,
  })

  if (!response.ok) {
    throw new Error(
      `${serviceName} request failed: ${response.status} ${response.statusText}`,
    )
  }

  return (await response.json()) as T
}

/**
 * Shared AutoShop API fetch: JSON content-type for bodies, throws on !ok.
 */
export async function apiFetch<T>(
  path: string,
  init: ApiFetchOptions = {},
): Promise<T> {
  return externalJsonFetch<T>(`${DEFAULT_API_BASE_URL}${path}`, init)
}
