/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import CustomerPortal from '../pages/customer-portal'
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

describe('CustomerPortal vehicle gate', () => {
  // This project runs Vitest without globals, so Testing Library's automatic
  // cleanup is not registered.
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('asks for the vehicle before showing any services', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<CustomerPortal parts={parts} />)

    expect(screen.getByText(/tell us about your vehicle/i)).toBeTruthy()
    expect(screen.getByText('0/17')).toBeTruthy()
    expect(screen.queryByText('Brake Pad Set')).toBeNull()
    expect(screen.queryByText('Oil Filter')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Brakes' })).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('decodes a VIN and then lists services for that vehicle', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(decodeResponse))
    vi.stubGlobal('fetch', fetchMock)

    render(<CustomerPortal parts={parts} />)
    await decodeAndConfirm()

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      `/DecodeVinValues/${VIN}`,
    )
    expect(screen.getByText('2021 FORD F-150')).toBeTruthy()
    expect(screen.getByText(VIN)).toBeTruthy()
    expect(screen.getByText('Brake Pad Set')).toBeTruthy()
    expect(screen.getByText('Oil Filter')).toBeTruthy()
  })

  it('lists services from a manual brand, model and year selection', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<CustomerPortal parts={parts} />)
    fireEvent.click(button(/brand · model · year/i))

    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Ford' } })
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'F-150' } })
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2021' } })
    fireEvent.click(button(/show available services/i))

    expect(screen.getByText('2021 Ford F-150')).toBeTruthy()
    expect(screen.getByText(/manual entry/i)).toBeTruthy()
    expect(screen.getByText('Brake Pad Set')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('filters the listed services by category', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(decodeResponse)))

    render(<CustomerPortal parts={parts} />)
    await decodeAndConfirm()

    fireEvent.click(button('Brakes'))
    expect(screen.getByText('Brake Pad Set')).toBeTruthy()
    expect(screen.queryByText('Oil Filter')).toBeNull()
  })

  it('returns to the vehicle form when the customer changes vehicle', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(decodeResponse)))

    render(<CustomerPortal parts={parts} />)
    await decodeAndConfirm()

    fireEvent.click(button(/change/i))

    expect(screen.getByText(/tell us about your vehicle/i)).toBeTruthy()
    expect(screen.getByText('0/17')).toBeTruthy()
    expect(screen.queryByText('Brake Pad Set')).toBeNull()
  })

  it('keeps the services hidden when the VIN service fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 503)))

    render(<CustomerPortal parts={parts} />)
    fireEvent.change(vinInput(), { target: { value: VIN } })
    fireEvent.click(button(/decode vin/i))

    await waitFor(() =>
      expect(screen.getByText(/could not reach the vin service/i)).toBeTruthy(),
    )
    expect(screen.queryByText('Brake Pad Set')).toBeNull()
  })

  it('shows a dash instead of services when the parts API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(decodeResponse)))

    render(<CustomerPortal parts={[]} unavailable />)
    await decodeAndConfirm()

    expect(screen.queryByText('Brake Pad Set')).toBeNull()
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)
  })
})
