import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  VPIC_VEHICLES_BASE_URL,
  VehicleServiceByVin,
} from '../service/vehicle-service-by-vin'
import type { VinDecodeApiResponse } from '../types/vehicle-by-vin'

const sampleFlatResult = {
  VIN: '1FTFW1E50MFA00001',
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
  ErrorText: '0 - VIN decoded clean. Check Digit (9th position) is correct',
}

const sampleResponse: VinDecodeApiResponse = {
  Count: 1,
  Message: 'Results returned successfully',
  SearchCriteria: 'VIN:1FTFW1E50MFA00001',
  Results: [sampleFlatResult],
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('VehicleServiceByVin', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('decodes a VIN via DecodeVinValues with format=json', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sampleResponse))
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleServiceByVin()
    const vehicle = await service.decodeByVin('1FTFW1E50MFA00001')

    expect(fetchMock).toHaveBeenCalledWith(
      `${VPIC_VEHICLES_BASE_URL}/DecodeVinValues/1FTFW1E50MFA00001?format=json`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(vehicle).toEqual({
      vin: '1FTFW1E50MFA00001',
      make: 'FORD',
      model: 'F-150',
      modelYear: '2021',
      bodyClass: 'Pickup',
      bodyCabType: 'Crew/Super Crew/Crew Max',
      series: 'F-Series',
      manufacturer: 'FORD MOTOR COMPANY',
      vehicleType: 'TRUCK',
      trim: '',
      driveType: '4WD/4-Wheel Drive/4x4',
      fuelTypePrimary: 'Gasoline',
      displacementL: '5.0',
      engineCylinders: '8',
      errorCode: '0',
      errorText:
        '0 - VIN decoded clean. Check Digit (9th position) is correct',
    })
  })

  it('includes optional modelyear query param', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sampleResponse))
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleServiceByVin()
    await service.decodeByVin('1FTFW1E50MFA00001', { modelYear: 2021 })

    expect(fetchMock).toHaveBeenCalledWith(
      `${VPIC_VEHICLES_BASE_URL}/DecodeVinValues/1FTFW1E50MFA00001?format=json&modelyear=2021`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
  })

  it('rejects an empty VIN before calling the API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleServiceByVin()
    await expect(service.decodeByVin('  ')).rejects.toThrow(
      'VehicleServiceByVin: VIN is required',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws when the HTTP response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 503))
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleServiceByVin()
    await expect(service.decodeByVin('1FTFW1E50MFA00001')).rejects.toThrow(
      'VehicleServiceByVin request failed: 503 Error',
    )
  })

  it('throws when Results is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ ...sampleResponse, Count: 0, Results: [] }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleServiceByVin()
    await expect(service.decodeByVin('1FTFW1E50MFA00001')).rejects.toThrow(
      'VehicleServiceByVin: no decode results returned',
    )
  })

  describe('decodeWmi', () => {
    const wmiResponse = {
      Count: 1,
      Message: 'Results returned successfully',
      SearchCriteria: 'WMI:1FT',
      Results: [
        {
          CommonName: 'Ford',
          Make: 'FORD',
          ManufacturerName: 'FORD MOTOR COMPANY',
          ParentCompanyName: '',
          VehicleType: 'Truck',
          URL: 'http://www.ford.com/',
        },
      ],
    }

    it('decodes the WMI prefix of a full VIN', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(wmiResponse))
      vi.stubGlobal('fetch', fetchMock)

      const service = new VehicleServiceByVin()
      const manufacturer = await service.decodeWmi('1FTFW1E50MFA00001')

      expect(fetchMock).toHaveBeenCalledWith(
        `${VPIC_VEHICLES_BASE_URL}/DecodeWMI/1FT?format=json`,
        expect.objectContaining({ headers: expect.any(Headers) }),
      )
      expect(manufacturer).toEqual({
        wmi: '1FT',
        commonName: 'Ford',
        make: 'FORD',
        manufacturerName: 'FORD MOTOR COMPANY',
        parentCompanyName: '',
        vehicleType: 'Truck',
        url: 'http://www.ford.com/',
      })
    })

    it('rejects a WMI shorter than three characters', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const service = new VehicleServiceByVin()
      await expect(service.decodeWmi('1F')).rejects.toThrow(
        'VehicleServiceByVin: WMI must be 3 characters',
      )
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('throws when the WMI is unknown', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({ ...wmiResponse, Count: 0, Results: [] }),
      )
      vi.stubGlobal('fetch', fetchMock)

      const service = new VehicleServiceByVin()
      await expect(service.decodeWmi('1FT')).rejects.toThrow(
        'VehicleServiceByVin: no WMI results returned',
      )
    })
  })
})
