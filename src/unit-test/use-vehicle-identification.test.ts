/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { useVehicleIdentification } from '../hooks/use-vehicle-identification'

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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('useVehicleIdentification', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('starts empty on the VIN tab without touching the network', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useVehicleIdentification())

    expect(result.current.entryTab).toBe('vin')
    expect(result.current.vinCharCount).toBe(0)
    expect(result.current.canDecode).toBe(false)
    expect(result.current.activeVehicle).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('counts only legal VIN characters and allows a decode past the minimum', () => {
    vi.stubGlobal('fetch', vi.fn())

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.changeVinInput('1ftfw1e50-mfa'))

    expect(result.current.vinInput).toBe('1FTFW1E50-MFA')
    expect(result.current.vinCharCount).toBe(12)
    expect(result.current.canDecode).toBe(true)
  })

  it('rejects an incomplete VIN without calling the API', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.changeVinInput('1FTFW1E50MFA'))
    act(() => result.current.decode())

    expect(result.current.error).toMatch(/invalid vin/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('prefills the manual selects from a decode and records it as recent', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(decodeResponse))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.decode(VIN))

    await waitFor(() => expect(result.current.manualBrand).toBe('Ford'))
    expect(result.current.entryTab).toBe('manual')
    expect(result.current.manualModel).toBe('F-150')
    expect(result.current.manualYear).toBe('2021')
    expect(result.current.recent.map(v => v.vin)).toEqual([VIN])

    // The decode alone must not unlock the catalog; confirmation does.
    expect(result.current.activeVehicle).toBeNull()
    act(() => result.current.confirm())
    expect(result.current.activeVehicle).toMatchObject({
      vin: VIN,
      make: 'FORD',
      model: 'F-150',
      year: '2021',
      cylinders: '8',
    })
  })

  it('reports a decode that returns no vehicle identity', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          ...decodeResponse,
          Results: [
            { ...decodeResponse.Results[0], Make: '', Model: '', ModelYear: '' },
          ],
        }),
      ),
    )

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.decode(VIN))

    await waitFor(() => expect(result.current.error).toMatch(/vehicle not found/i))
    expect(result.current.activeVehicle).toBeNull()
  })

  it('reports an unreachable VIN service', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 503)))

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.decode(VIN))

    await waitFor(() =>
      expect(result.current.error).toMatch(/could not reach the vin service/i),
    )
  })

  it('builds a vehicle from a manual selection without any request', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.selectBrand('Ford'))
    expect(result.current.manualVehicle).toBeNull()

    act(() => result.current.selectModel('F-150'))
    act(() => result.current.selectYear('2021'))
    act(() => result.current.confirm())

    expect(result.current.activeVehicle).toMatchObject({
      vin: '',
      make: 'Ford',
      model: 'F-150',
      year: '2021',
      cylinders: 'N/A',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('drops the dependent selections when the brand or model changes', () => {
    vi.stubGlobal('fetch', vi.fn())

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.selectBrand('Ford'))
    act(() => result.current.selectModel('F-150'))
    act(() => result.current.selectYear('2021'))
    act(() => result.current.confirm())

    act(() => result.current.selectBrand('Toyota'))

    expect(result.current.manualModel).toBe('')
    expect(result.current.manualYear).toBe('')
    expect(result.current.activeVehicle).toBeNull()
  })

  it('keeps the decoded VIN off a manually corrected vehicle', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(decodeResponse)))

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.decode(VIN))
    await waitFor(() => expect(result.current.manualBrand).toBe('Ford'))

    act(() => result.current.selectYear('2019'))
    act(() => result.current.confirm())

    expect(result.current.activeVehicle).toMatchObject({
      vin: '',
      make: 'Ford',
      model: 'F-150',
      year: '2019',
    })
  })

  it('re-opens a recent lookup without decoding again', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(decodeResponse))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.decode(VIN))
    await waitFor(() => expect(result.current.recent.length).toBe(1))

    const entry = result.current.recent[0]
    act(() => result.current.clear())
    act(() => result.current.selectRecent(entry))
    act(() => result.current.confirm())

    expect(result.current.activeVehicle).toMatchObject({ vin: VIN, model: 'F-150' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('clears back to an empty VIN tab but keeps recent lookups', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(decodeResponse)))

    const { result } = renderHook(() => useVehicleIdentification())
    act(() => result.current.decode(VIN))
    await waitFor(() => expect(result.current.recent.length).toBe(1))
    act(() => result.current.confirm())

    act(() => result.current.clear())

    expect(result.current.entryTab).toBe('vin')
    expect(result.current.vinInput).toBe('')
    expect(result.current.manualBrand).toBe('')
    expect(result.current.activeVehicle).toBeNull()
    expect(result.current.recent.length).toBe(1)
  })
})
