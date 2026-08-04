import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_API_BASE_URL } from '../constant/api'
import { PartService } from '../service/part-service'
import type { PartRequest, PartResponse } from '../types/part'

const sampleResponse: PartResponse = {
  id: 'p1',
  sku: 'BRK-PAD-001',
  name: 'Brake Pad Set',
  category: 'Brakes',
  stock: 12,
  threshold: 5,
  reorderQty: 20,
  unitPrice: 45.5,
  markupPct: 25,
  labourCost: 30,
  supplier: 'Bosch',
  location: 'A1',
  autoReorder: true,
  status: 'ok',
}

const sampleRequest: PartRequest = {
  sku: 'BRK-PAD-001',
  name: 'Brake Pad Set',
  category: 'Brakes',
  unitPrice: 45.5,
  markupPct: 25,
  labourCost: 30,
  supplier: 'Bosch',
  location: 'A1',
  stock: 12,
  threshold: 5,
  reorderQty: 20,
  autoReorder: true,
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('PartService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('lists parts with category and search query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([sampleResponse]))
    vi.stubGlobal('fetch', fetchMock)

    const service = new PartService()
    const parts = await service.list({ category: 'Brakes', search: 'pad' })

    expect(fetchMock).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/api/parts?category=Brakes&search=pad`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(parts).toEqual([
      {
        id: 'p1',
        sku: 'BRK-PAD-001',
        name: 'Brake Pad Set',
        category: 'Brakes',
        stock: 12,
        threshold: 5,
        reorderQty: 20,
        unitPrice: 45.5,
        markupPct: 25,
        labourCost: 30,
        supplier: 'Bosch',
        location: 'A1',
        autoReorder: true,
      },
    ])
  })

  it('gets a part by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sampleResponse))
    vi.stubGlobal('fetch', fetchMock)

    const service = new PartService()
    const part = await service.get('p1')

    expect(fetchMock).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/api/parts/p1`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(part.id).toBe('p1')
    expect(part.name).toBe('Brake Pad Set')
  })

  it('creates a part with POST body', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(sampleResponse, 201))
    vi.stubGlobal('fetch', fetchMock)

    const service = new PartService()
    const part = await service.create(sampleRequest)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${DEFAULT_API_BASE_URL}/api/parts`)
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(sampleRequest))
    expect(new Headers(init.headers).get('Content-Type')).toBe(
      'application/json',
    )
    expect(part.sku).toBe('BRK-PAD-001')
  })

  it('updates a part with PUT body', async () => {
    const updated = { ...sampleResponse, name: 'Brake Pad Set Deluxe' }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(updated))
    vi.stubGlobal('fetch', fetchMock)

    const service = new PartService()
    const request = { ...sampleRequest, name: 'Brake Pad Set Deluxe' }
    const part = await service.update('p1', request)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${DEFAULT_API_BASE_URL}/api/parts/p1`)
    expect(init.method).toBe('PUT')
    expect(init.body).toBe(JSON.stringify(request))
    expect(part.name).toBe('Brake Pad Set Deluxe')
  })

  it('throws when the response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 404))
    vi.stubGlobal('fetch', fetchMock)

    const service = new PartService()

    await expect(service.get('missing')).rejects.toThrow(
      'PartService request failed: 404 Error',
    )
  })
})
