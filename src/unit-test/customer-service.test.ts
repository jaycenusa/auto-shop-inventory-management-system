import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_API_BASE_URL } from '../constant/api'
import { CustomerService } from '../service/customer-service'
import type { CustomerRequest, CustomerResponse } from '../types/customer'

const sampleResponse: CustomerResponse = {
  id: 'c1',
  name: 'Acme Motors',
  email: 'ops@acme.test',
  phone: '555-0100',
  company: 'Acme Inc',
  totalOrders: 12,
  lastOrder: '2026-07-01',
  totalSpent: 4200,
  status: 'active',
}

const sampleRequest: CustomerRequest = {
  name: 'Acme Motors',
  email: 'ops@acme.test',
  phone: '555-0100',
  company: 'Acme Inc',
  totalOrders: 12,
  lastOrder: '2026-07-01',
  totalSpent: 4200,
  status: 'active',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('CustomerService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('lists customers with q and status query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([sampleResponse]))
    vi.stubGlobal('fetch', fetchMock)

    const service = new CustomerService()
    const customers = await service.list({ q: 'acme', status: 'active' })

    expect(fetchMock).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/api/customers?q=acme&status=active`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(customers).toEqual([sampleResponse])
  })

  it('gets a customer by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sampleResponse))
    vi.stubGlobal('fetch', fetchMock)

    const service = new CustomerService()
    const customer = await service.get('c1')

    expect(fetchMock).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/api/customers/c1`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(customer.id).toBe('c1')
  })

  it('gets customer stats', async () => {
    const stats = {
      totalCustomers: 10,
      activeCustomers: 7,
      totalOrders: 40,
      totalRevenue: 9000,
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(stats))
    vi.stubGlobal('fetch', fetchMock)

    const service = new CustomerService()
    await expect(service.getStats()).resolves.toEqual(stats)
    expect(fetchMock).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/api/customers/stats`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
  })

  it('creates a customer with POST body', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(sampleResponse, 201))
    vi.stubGlobal('fetch', fetchMock)

    const service = new CustomerService()
    const customer = await service.create(sampleRequest)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${DEFAULT_API_BASE_URL}/api/customers`)
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(sampleRequest))
    expect(customer.name).toBe('Acme Motors')
  })

  it('updates a customer with PUT body', async () => {
    const updated = { ...sampleResponse, name: 'Acme Fleet' }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(updated))
    vi.stubGlobal('fetch', fetchMock)

    const service = new CustomerService()
    const request = { ...sampleRequest, name: 'Acme Fleet' }
    const customer = await service.update('c1', request)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${DEFAULT_API_BASE_URL}/api/customers/c1`)
    expect(init.method).toBe('PUT')
    expect(customer.name).toBe('Acme Fleet')
  })

  it('throws when the response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 404))
    vi.stubGlobal('fetch', fetchMock)

    const service = new CustomerService()
    await expect(service.get('missing')).rejects.toThrow(
      'CustomerService request failed: 404 Error',
    )
  })
})
