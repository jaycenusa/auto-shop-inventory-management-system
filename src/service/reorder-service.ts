import {
  mapReorderResponse,
  type ReorderEntry,
  type ReorderRequest,
  type ReorderResponse,
  type ReorderStatus,
  type ReorderStatusUpdateRequest,
} from '../types/reorder-entry'
import { apiFetch } from './http'

export type ReorderListFilters = {
  status?: ReorderStatus
}

export class ReorderService {
  async list(filters: ReorderListFilters = {}): Promise<ReorderEntry[]> {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    const query = params.toString()
    const path = query ? `/api/reorders?${query}` : '/api/reorders'
    const data = await apiFetch<ReorderResponse[]>(path, {
      serviceName: 'ReorderService',
    })
    return data.map(mapReorderResponse)
  }

  async get(id: string): Promise<ReorderEntry> {
    const data = await apiFetch<ReorderResponse>(
      `/api/reorders/${encodeURIComponent(id)}`,
      { serviceName: 'ReorderService' },
    )
    return mapReorderResponse(data)
  }

  async create(data: ReorderRequest): Promise<ReorderEntry> {
    const response = await apiFetch<ReorderResponse>('/api/reorders', {
      method: 'POST',
      body: JSON.stringify(data),
      serviceName: 'ReorderService',
    })
    return mapReorderResponse(response)
  }

  async updateStatus(
    id: string,
    data: ReorderStatusUpdateRequest,
  ): Promise<ReorderEntry> {
    const response = await apiFetch<ReorderResponse>(
      `/api/reorders/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        serviceName: 'ReorderService',
      },
    )
    return mapReorderResponse(response)
  }
}

export const reorderService = new ReorderService()
