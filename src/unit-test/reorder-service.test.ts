import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_API_BASE_URL } from '../constant/api'
import { ReorderService } from '../service/reorder-service'
import type {
  ReorderRequest,
  ReorderResponse,
} from '../types/reorder-entry'

const sampleResponse: ReorderResponse = {
  id: 'r1',
  partId: 'p1',
  partSku: 'BRK-PAD-001',
  partName: 'Brake Pad Set',
  quantity: 20,
  supplier: 'Bosch',
  unitCost: 45.5,
  status: 'pending',
  type: 'manual',
  createdAt: '2026-07-14',
}

const sampleRequest: ReorderRequest = {
  partId: 'p1',
  quantity: 20,
  supplier: 'Bosch',
  unitCost: 45.5,
  type: 'manual',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('ReorderService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('lists reorders with optional status query', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([sampleResponse]))
    vi.stubGlobal('fetch', fetchMock)

    const service = new ReorderService()
    const reorders = await service.list({ status: 'pending' })

    expect(fetchMock).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/api/reorders?status=pending`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(reorders).toEqual([sampleResponse])
  })

  it('gets a reorder by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sampleResponse))
    vi.stubGlobal('fetch', fetchMock)

    const service = new ReorderService()
    const reorder = await service.get('r1')

    expect(fetchMock).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/api/reorders/r1`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(reorder.id).toBe('r1')
  })

  it('creates a reorder with POST body', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(sampleResponse, 201))
    vi.stubGlobal('fetch', fetchMock)

    const service = new ReorderService()
    const reorder = await service.create(sampleRequest)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${DEFAULT_API_BASE_URL}/api/reorders`)
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(sampleRequest))
    expect(reorder.partId).toBe('p1')
  })

  it('updates reorder status with PATCH body', async () => {
    const updated = { ...sampleResponse, status: 'ordered' as const }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(updated))
    vi.stubGlobal('fetch', fetchMock)

    const service = new ReorderService()
    const reorder = await service.updateStatus('r1', { status: 'ordered' })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${DEFAULT_API_BASE_URL}/api/reorders/r1/status`)
    expect(init.method).toBe('PATCH')
    expect(init.body).toBe(JSON.stringify({ status: 'ordered' }))
    expect(reorder.status).toBe('ordered')
  })

  it('throws when the response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 500))
    vi.stubGlobal('fetch', fetchMock)

    const service = new ReorderService()
    await expect(service.list()).rejects.toThrow(
      'ReorderService request failed: 500 Error',
    )
  })
})
