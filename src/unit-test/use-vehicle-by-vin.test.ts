/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useVehicleByVin } from '../hooks/use-vehicle-by-vin'
import type { PartResponse } from '../types/part'

const VIN = '1FTFW1E50MFA00001'

const decodeResponse = {
  Count: 1,
  Message: 'Results returned successfully',
  SearchCriteria: `VIN:${VIN}`,
  Results: [
    {
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
    },
  ],
}

const recallsResponse = {
  Count: 1,
  Message: 'Results returned successfully',
  results: [
    {
      Manufacturer: 'Ford Motor Company',
      NHTSACampaignNumber: '21V986000',
      parkIt: false,
      parkOutSide: false,
      overTheAirUpdate: false,
      ReportReceivedDate: '16/12/2021',
      Component: 'POWER TRAIN:DRIVELINE:DRIVESHAFT',
      Summary: 'Summary',
      Consequence: 'Consequence',
      Remedy: 'Remedy',
      Notes: 'Notes',
      ModelYear: '2021',
      Make: 'FORD',
      Model: 'F-150',
    },
  ],
}

const safetyModelsResponse = {
  Count: 1,
  Message: 'Results returned successfully',
  Results: [
    { ModelYear: 2021, Make: 'FORD', Model: 'F-150 SUPER CREW', VehicleId: 0 },
  ],
}

const safetyVehiclesResponse = {
  Count: 1,
  Message: 'Results returned successfully',
  Results: [
    {
      VehicleDescription: '2021 Ford F-150 Super Crew PU/CC 4WD',
      VehicleId: 15428,
    },
  ],
}

const safetyDetailResponse = {
  Count: 1,
  Message: 'Results returned successfully',
  Results: [
    {
      VehicleId: 15428,
      VehicleDescription: '2021 Ford F-150 Super Crew PU/CC 4WD',
      ModelYear: 2021,
      Make: 'FORD',
      Model: 'F-150 SUPER CREW',
      OverallRating: '5',
      OverallFrontCrashRating: '5',
      FrontCrashDriversideRating: '5',
      FrontCrashPassengersideRating: '5',
      OverallSideCrashRating: '5',
      SideCrashDriversideRating: '5',
      SideCrashPassengersideRating: '5',
      SidePoleCrashRating: '5',
      RolloverRating: '4',
      RolloverPossibility: 0.191,
    },
  ],
}

const partResponse: PartResponse = {
  id: 'p1',
  sku: 'TRN-CASE-001',
  name: 'F-150 Transfer Case',
  category: 'Transmission',
  stock: 4,
  threshold: 2,
  reorderQty: 6,
  unitPrice: 890,
  markupPct: 20,
  labourCost: 220,
  supplier: 'Ford OEM',
  location: 'C3',
  autoReorder: false,
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

type RouteOverrides = {
  decode?: () => Promise<Response>
  recalls?: () => Promise<Response>
  parts?: () => Promise<Response>
}

/** Routes each fan-out request by URL so call order stays irrelevant. */
function routedFetch(overrides: RouteOverrides = {}) {
  return vi.fn(async (input: string) => {
    const url = String(input)
    if (url.includes('/DecodeVinValues/')) {
      return overrides.decode?.() ?? jsonResponse(decodeResponse)
    }
    if (url.includes('/recalls/recallsByVehicle')) {
      return overrides.recalls?.() ?? jsonResponse(recallsResponse)
    }
    if (url.includes('/SafetyRatings/VehicleId/')) {
      return jsonResponse(safetyDetailResponse)
    }
    if (url.includes('/model/')) {
      return jsonResponse(safetyVehiclesResponse)
    }
    if (url.includes('/SafetyRatings/modelyear/')) {
      return jsonResponse(safetyModelsResponse)
    }
    if (url.includes('/api/parts')) {
      return overrides.parts?.() ?? jsonResponse([partResponse])
    }
    throw new Error(`unexpected request: ${url}`)
  })
}

describe('useVehicleByVin', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('issues no requests without a decodable VIN', async () => {
    const fetchMock = routedFetch()
    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook(
      ({ vin }: { vin: string | null }) => useVehicleByVin({ vin }),
      { initialProps: { vin: null as string | null } },
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchMock).not.toHaveBeenCalled()

    rerender({ vin: '   ' })
    await waitFor(() => expect(result.current.loading).toBe(false))
    rerender({ vin: '1FTFW1Q5!' })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.vehicle).toBeNull()
    expect(result.current.recalls).toEqual([])
    expect(result.current.matchedParts).toEqual([])
  })

  it('decodes the VIN then fans out to recalls, safety and parts', async () => {
    const fetchMock = routedFetch()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useVehicleByVin({ vin: ' 1ftfw1e50-mfa00001 ' }))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.vin).toBe(VIN)
    expect(result.current.vehicle?.model).toBe('F-150')
    expect(result.current.vehicleLabel).toBe('2021 FORD F-150')
    expect(result.current.recalls).toHaveLength(1)
    expect(result.current.recalls[0]?.campaignNumber).toBe('21V986000')
    expect(result.current.safety?.resolvedModel).toBe('F-150 SUPER CREW')
    expect(result.current.safety?.variants[0]?.ratings.overallRating).toBe('5')
    expect(result.current.matchedParts).toHaveLength(1)
    expect(result.current.errors).toEqual({
      vehicle: null,
      recalls: null,
      safety: null,
      parts: null,
    })

    const partsCall = fetchMock.mock.calls.find(call =>
      String(call[0]).includes('/api/parts'),
    )
    expect(String(partsCall?.[0])).toContain(
      '/api/parts?category=Transmission&search=FORD+F-150',
    )
  })

  it('keeps vehicle and parts when the recalls source fails', async () => {
    const fetchMock = routedFetch({
      recalls: async () => jsonResponse({}, 503),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useVehicleByVin({ vin: VIN }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.vehicle?.make).toBe('FORD')
    expect(result.current.matchedParts).toHaveLength(1)
    expect(result.current.recalls).toEqual([])
    expect(result.current.errors.recalls?.message).toContain(
      'VehicleRecallService request failed: 503',
    )
    expect(result.current.errors.parts).toBeNull()
    expect(result.current.errors.vehicle).toBeNull()
  })

  it('reports a decode failure and skips the fan-out', async () => {
    const fetchMock = routedFetch({ decode: async () => jsonResponse({}, 503) })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useVehicleByVin({ vin: VIN }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.current.vehicle).toBeNull()
    expect(result.current.errors.vehicle?.message).toContain(
      'VehicleServiceByVin request failed: 503',
    )
    expect(result.current.errors.recalls).toBeNull()
  })

  it('requests only the sources a consumer opts into', async () => {
    const fetchMock = routedFetch()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useVehicleByVin({
        vin: VIN,
        sources: { recalls: false, safety: false, parts: false },
      }),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/DecodeVinValues/')
    expect(result.current.vehicle?.model).toBe('F-150')
    expect(result.current.recalls).toEqual([])
    expect(result.current.safety).toBeNull()
    expect(result.current.matchedParts).toEqual([])
    expect(result.current.errors).toEqual({
      vehicle: null,
      recalls: null,
      safety: null,
      parts: null,
    })
  })

  it('keeps fetching the sources left enabled', async () => {
    const fetchMock = routedFetch()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useVehicleByVin({ vin: VIN, sources: { safety: false } }),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    const urls = fetchMock.mock.calls.map(call => String(call[0]))
    expect(urls.some(url => url.includes('/recalls/recallsByVehicle'))).toBe(true)
    expect(urls.some(url => url.includes('/api/parts'))).toBe(true)
    expect(urls.some(url => url.includes('/SafetyRatings/'))).toBe(false)
    expect(result.current.recalls).toHaveLength(1)
    expect(result.current.safety).toBeNull()
  })

  it('does not refetch when an inline sources object is re-created', async () => {
    const fetchMock = routedFetch()
    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook(() =>
      useVehicleByVin({ vin: VIN, sources: { recalls: false, safety: false } }),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    const callCount = fetchMock.mock.calls.length

    rerender()
    rerender()

    expect(fetchMock.mock.calls.length).toBe(callCount)
  })

  it('refetches when the VIN changes', async () => {
    const fetchMock = routedFetch()
    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook(
      ({ vin }: { vin: string | null }) => useVehicleByVin({ vin }),
      { initialProps: { vin: VIN as string | null } },
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    const firstCallCount = fetchMock.mock.calls.length

    rerender({ vin: '1FTMF1CB0MKD00001' })
    await waitFor(() =>
      expect(fetchMock.mock.calls.length).toBeGreaterThan(firstCallCount),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
  })
})
