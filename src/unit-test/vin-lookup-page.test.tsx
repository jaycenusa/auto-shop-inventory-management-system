/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import VinLookup from '../pages/vin-lookup'
import type { Part } from '../types/part'

const VIN = '1FTFW1E50MFA00001'

const decodeResult = {
  VIN,
  Make: 'FORD',
  Model: 'F-150',
  ModelYear: '2021',
  BodyClass: 'Pickup',
  BodyCabType: 'Crew/Super Crew/Crew Max',
  Series: 'F-Series',
  Manufacturer: 'FORD MOTOR COMPANY',
  VehicleType: 'TRUCK',
  Trim: '',
  DriveType: '4WD/4-Wheel Drive/4x4',
  FuelTypePrimary: 'Gasoline',
  DisplacementL: '5.0',
  EngineCylinders: '8',
  ErrorCode: '0',
  ErrorText: '0 - VIN decoded clean',
}

const decodeResponse = {
  Count: 1,
  Message: 'Results returned successfully',
  SearchCriteria: `VIN:${VIN}`,
  Results: [decodeResult],
}

const parts: Part[] = [
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
    autoReorder: false,
  },
  {
    id: 'p2',
    sku: 'ENG-OIL-001',
    name: 'Oil Filter',
    category: 'Engine',
    stock: 0,
    threshold: 4,
    reorderQty: 10,
    unitPrice: 12,
    markupPct: 30,
    labourCost: 15,
    supplier: 'Mann',
    location: 'B2',
    autoReorder: true,
  },
]

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

function renderPage({ unavailable = false } = {}) {
  const onQuickReorder = vi.fn<(part: Part) => void>()
  render(
    <VinLookup
      parts={parts}
      unavailable={unavailable}
      onQuickReorder={onQuickReorder}
    />,
  )
  return { onQuickReorder }
}

function vinInput() {
  return screen.getByPlaceholderText(/1HGBH41JXMN109186/)
}

function button(name: RegExp | string): HTMLButtonElement {
  return screen.getByRole('button', { name }) as HTMLButtonElement
}

/** Decode, then confirm on the prefilled manual tab, as the design requires. */
async function decodeAndConfirm() {
  fireEvent.change(vinInput(), { target: { value: VIN } })
  fireEvent.click(button(/decode vin/i))
  const confirm = await screen.findByRole('button', {
    name: /show available services/i,
  })
  fireEvent.click(confirm)
}

describe('VinLookup page', () => {
  // This project runs Vitest without globals, so Testing Library's automatic
  // cleanup is not registered.
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('starts on the VIN entry panel with no vehicle and no requests', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderPage()

    expect(screen.getByText(/enter a 17-character vin above/i)).toBeTruthy()
    expect(screen.getByText('0/17')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('counts only legal VIN characters and enables decode past the minimum', () => {
    vi.stubGlobal('fetch', vi.fn())

    renderPage()
    expect(button(/decode vin/i).disabled).toBe(true)

    fireEvent.change(vinInput(), { target: { value: '1ftfw1e50-mfa' } })

    expect(screen.getByText('12/17')).toBeTruthy()
    expect(button(/decode vin/i).disabled).toBe(false)
  })

  it('rejects an incomplete VIN without calling the API', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderPage()
    fireEvent.change(vinInput(), { target: { value: '1FTFW1E50MFA' } })
    fireEvent.click(button(/decode vin/i))

    expect(screen.getByText(/invalid vin/i)).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('decodes a VIN and shows the vehicle plus compatible parts once confirmed', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(decodeResponse))
    vi.stubGlobal('fetch', fetchMock)

    renderPage()
    await decodeAndConfirm()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      `/DecodeVinValues/${VIN}`,
    )

    expect(screen.getByText('2021 FORD F-150')).toBeTruthy()
    expect(screen.getByText(/vehicle decoded/i)).toBeTruthy()
    expect(screen.getByText('8-cylinder')).toBeTruthy()
    expect(screen.getByText('BRK-PAD-001')).toBeTruthy()
    expect(screen.getByText('ENG-OIL-001')).toBeTruthy()
    expect(screen.getByText(/2 of 2 parts shown/i)).toBeTruthy()
  })

  it('filters the parts table by search, category and stock', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(decodeResponse)))

    renderPage()
    await decodeAndConfirm()
    const searchBox = screen.getByPlaceholderText(/search parts or sku/i)

    fireEvent.change(searchBox, { target: { value: 'oil' } })
    expect(screen.queryByText('BRK-PAD-001')).toBeNull()
    expect(screen.getByText('ENG-OIL-001')).toBeTruthy()

    fireEvent.change(searchBox, { target: { value: '' } })
    fireEvent.click(button('Brakes'))
    expect(screen.getByText('BRK-PAD-001')).toBeTruthy()
    expect(screen.queryByText('ENG-OIL-001')).toBeNull()

    fireEvent.click(button('All'))
    fireEvent.click(button(/in stock only/i))
    expect(screen.getByText('BRK-PAD-001')).toBeTruthy()
    expect(screen.queryByText('ENG-OIL-001')).toBeNull()
  })

  it('hands a part to the quick-reorder modal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(decodeResponse)))

    const { onQuickReorder } = renderPage()
    await decodeAndConfirm()

    fireEvent.click(screen.getAllByRole('button', { name: /order/i })[0])

    expect(onQuickReorder).toHaveBeenCalledTimes(1)
    expect(onQuickReorder.mock.calls[0][0]).toMatchObject({ sku: 'BRK-PAD-001' })
  })

  it('surfaces a decode failure and stays on the entry panel', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 503)))

    renderPage()
    fireEvent.change(vinInput(), { target: { value: VIN } })
    fireEvent.click(button(/decode vin/i))

    await waitFor(() =>
      expect(screen.getByText(/could not reach the vin service/i)).toBeTruthy(),
    )
    expect(screen.queryByText('2021 FORD F-150')).toBeNull()
  })

  it('reports a decode that returns no vehicle identity', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          ...decodeResponse,
          Results: [{ ...decodeResult, Make: '', Model: '', ModelYear: '' }],
        }),
      ),
    )

    renderPage()
    fireEvent.change(vinInput(), { target: { value: VIN } })
    fireEvent.click(button(/decode vin/i))

    await waitFor(() =>
      expect(screen.getByText(/vehicle not found/i)).toBeTruthy(),
    )
  })

  it('browses parts from a manual brand, model and year selection', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderPage()
    fireEvent.click(button(/brand · model · year/i))

    fireEvent.change(screen.getByLabelText('Brand'), {
      target: { value: 'Ford' },
    })
    fireEvent.change(screen.getByLabelText('Model'), {
      target: { value: 'F-150' },
    })
    fireEvent.change(screen.getByLabelText('Year'), {
      target: { value: '2021' },
    })
    fireEvent.click(button(/show available services/i))

    expect(screen.getByText('2021 Ford F-150')).toBeTruthy()
    expect(screen.getByText('BRK-PAD-001')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('clears back to the empty entry panel but keeps recent lookups', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(decodeResponse)))

    renderPage()
    await decodeAndConfirm()
    expect(
      screen.getByRole('heading', { name: '2021 FORD F-150' }),
    ).toBeTruthy()

    fireEvent.click(button(/clear/i))

    expect(screen.queryByRole('heading', { name: '2021 FORD F-150' })).toBeNull()
    expect(screen.getByText(/enter a 17-character vin above/i)).toBeTruthy()
    expect(screen.getByText('0/17')).toBeTruthy()
    expect(button(/2021 FORD F-150/)).toBeTruthy()
  })

  it('re-opens a recent lookup without decoding again', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(decodeResponse))
    vi.stubGlobal('fetch', fetchMock)

    renderPage()
    await decodeAndConfirm()
    fireEvent.click(button(/clear/i))
    fireEvent.click(button(/2021 FORD F-150/))
    fireEvent.click(button(/show available services/i))

    expect(
      screen.getByRole('heading', { name: '2021 FORD F-150' }),
    ).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows a dash instead of parts when the inventory API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(decodeResponse)))

    renderPage({ unavailable: true })
    await decodeAndConfirm()

    expect(screen.queryByText('BRK-PAD-001')).toBeNull()
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)
  })
})
