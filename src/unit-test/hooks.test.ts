/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useParts } from '../hooks/use-parts'
import { useCustomers } from '../hooks/use-customers'
import { useReorders } from '../hooks/use-reorders'
import type { PartResponse } from '../types/part'
import type { CustomerResponse } from '../types/customer'
import type { ReorderResponse } from '../types/reorder-entry'

const partResponse: PartResponse = {
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
}

const customerResponse: CustomerResponse = {
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

const reorderResponse: ReorderResponse = {
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('data hooks', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('useParts fetches when requestKey is set and exposes memoized parts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([partResponse]))
    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook(() =>
      useParts({ requestKey: 'inventory' }),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.parts).toHaveLength(1)
    expect(result.current.parts[0]?.sku).toBe('BRK-PAD-001')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const firstParts = result.current.parts
    rerender()
    expect(result.current.parts).toBe(firstParts)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('useParts refetches when requestKey changes between tabs', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([partResponse]))
    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook(
      ({ requestKey }: { requestKey: string | null }) => useParts({ requestKey }),
      { initialProps: { requestKey: 'inventory' as string | null } },
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchMock).toHaveBeenCalledTimes(1)

    rerender({ requestKey: 'reorders' })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    rerender({ requestKey: null })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('useParts skips fetch when requestKey is null', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([partResponse]))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useParts({ requestKey: null }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.parts).toEqual([])
  })

  it('useParts create updates local state without a full list refetch', async () => {
    const created = { ...partResponse, id: 'p2', sku: 'ENG-OIL-001', name: 'Oil Filter' }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([partResponse]))
      .mockResolvedValueOnce(jsonResponse(created, 201))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useParts({ requestKey: 'inventory' }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.create({
        sku: 'ENG-OIL-001',
        name: 'Oil Filter',
        category: 'Engine',
        unitPrice: 10,
        markupPct: 20,
        labourCost: 5,
        supplier: 'Mann',
        location: 'B1',
      })
    })

    expect(result.current.parts).toHaveLength(2)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('useCustomers fetches when requestKey is set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([customerResponse]))
    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook(
      ({ requestKey }: { requestKey: string | null }) =>
        useCustomers({ requestKey }),
      { initialProps: { requestKey: 'customers' as string | null } },
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.customers[0]?.id).toBe('c1')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    rerender({ requestKey: 'dashboard' })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })

  it('useReorders fetches on requestKey and updateStatus patches local state', async () => {
    const updated = { ...reorderResponse, status: 'ordered' as const }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([reorderResponse]))
      .mockResolvedValueOnce(jsonResponse(updated))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useReorders({ requestKey: 'reorders' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.updateStatus('r1', 'ordered')
    })

    expect(result.current.reorders[0]?.status).toBe('ordered')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('useParts clears data and sets error when fetch fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('{}', { status: 500, statusText: 'Error' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useParts({ requestKey: 'inventory' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeTruthy()
    expect(result.current.parts).toEqual([])
  })
})
