import {
  mapCustomerResponse,
  mapCustomerStatsResponse,
  type Customer,
  type CustomerRequest,
  type CustomerResponse,
  type CustomerStats,
  type CustomerStatsResponse,
  type CustomerStatus,
} from '../types/customer'
import { apiFetch } from './http'

export type CustomerFilterStatus = 'all' | CustomerStatus

export type CustomerListFilters = {
  q?: string
  status?: CustomerFilterStatus
}

export class CustomerService {
  async list(filters: CustomerListFilters = {}): Promise<Customer[]> {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status)
    }
    const query = params.toString()
    const path = query ? `/api/customers?${query}` : '/api/customers'
    const data = await apiFetch<CustomerResponse[]>(path, {
      serviceName: 'CustomerService',
    })
    return data.map(mapCustomerResponse)
  }

  async get(id: string): Promise<Customer> {
    const data = await apiFetch<CustomerResponse>(
      `/api/customers/${encodeURIComponent(id)}`,
      { serviceName: 'CustomerService' },
    )
    return mapCustomerResponse(data)
  }

  async getStats(): Promise<CustomerStats> {
    const data = await apiFetch<CustomerStatsResponse>('/api/customers/stats', {
      serviceName: 'CustomerService',
    })
    return mapCustomerStatsResponse(data)
  }

  async create(data: CustomerRequest): Promise<Customer> {
    const response = await apiFetch<CustomerResponse>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
      serviceName: 'CustomerService',
    })
    return mapCustomerResponse(response)
  }

  async update(id: string, data: CustomerRequest): Promise<Customer> {
    const response = await apiFetch<CustomerResponse>(
      `/api/customers/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
        serviceName: 'CustomerService',
      },
    )
    return mapCustomerResponse(response)
  }
}

export const customerService = new CustomerService()
