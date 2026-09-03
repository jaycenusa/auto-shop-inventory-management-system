import {
  mapPartResponse,
  type Part,
  type PartRequest,
  type PartResponse,
} from '../types/part'
import { apiFetch } from './http'

export type PartListFilters = {
  category?: string
  search?: string
}

export class PartService {
  async list(filters: PartListFilters = {}): Promise<Part[]> {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.search) params.set('search', filters.search)
    const query = params.toString()
    const path = query ? `/api/parts?${query}` : '/api/parts'
    const data = await apiFetch<PartResponse[]>(path, {
      serviceName: 'PartService',
    })
    return data.map(mapPartResponse)
  }

  async get(id: string): Promise<Part> {
    const data = await apiFetch<PartResponse>(
      `/api/parts/${encodeURIComponent(id)}`,
      { serviceName: 'PartService' },
    )
    return mapPartResponse(data)
  }

  async create(data: PartRequest): Promise<Part> {
    const response = await apiFetch<PartResponse>('/api/parts', {
      method: 'POST',
      body: JSON.stringify(data),
      serviceName: 'PartService',
    })
    return mapPartResponse(response)
  }

  async update(id: string, data: PartRequest): Promise<Part> {
    const response = await apiFetch<PartResponse>(
      `/api/parts/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
        serviceName: 'PartService',
      },
    )
    return mapPartResponse(response)
  }
}

export const partService = new PartService()
