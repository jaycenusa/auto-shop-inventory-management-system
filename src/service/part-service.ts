import { DEFAULT_API_BASE_URL } from '../constant/api'
import {
  mapPartResponse,
  type Part,
  type PartRequest,
  type PartResponse,
} from '../types/part'

export type PartListFilters = {
  category?: string
  search?: string
}

async function fetchPartsApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${DEFAULT_API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    throw new Error(
      `PartService request failed: ${response.status} ${response.statusText}`,
    )
  }

  return (await response.json()) as T
}

export class PartService {
  async list(filters: PartListFilters = {}): Promise<Part[]> {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.search) params.set('search', filters.search)
    const query = params.toString()
    const path = query ? `/api/parts?${query}` : '/api/parts'
    const data = await fetchPartsApi<PartResponse[]>(path)
    return data.map(mapPartResponse)
  }

  async get(id: string): Promise<Part> {
    const data = await fetchPartsApi<PartResponse>(
      `/api/parts/${encodeURIComponent(id)}`,
    )
    return mapPartResponse(data)
  }

  async create(data: PartRequest): Promise<Part> {
    const response = await fetchPartsApi<PartResponse>('/api/parts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapPartResponse(response)
  }

  async update(id: string, data: PartRequest): Promise<Part> {
    const response = await fetchPartsApi<PartResponse>(
      `/api/parts/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    )
    return mapPartResponse(response)
  }
}

export const partService = new PartService()
