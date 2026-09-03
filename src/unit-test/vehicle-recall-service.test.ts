import { afterEach, describe, expect, it, vi } from 'vitest'
import { NHTSA_API_BASE_URL } from '../constant/nhtsa'
import { VehicleRecallService } from '../service/vehicle-recall-service'
import type { VehicleRecallApiResponse } from '../types/vehicle-recall'

const sampleResponse: VehicleRecallApiResponse = {
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
      Summary: 'Underbody insulators may contact the driveshaft.',
      Consequence: 'A fractured driveshaft can cause a loss of drive power.',
      Remedy: 'Dealers will inspect and repair the driveshaft.',
      Notes: 'Owners may also contact the NHTSA hotline.',
      ModelYear: '2021',
      Make: 'FORD',
      Model: 'F-150',
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

describe('VehicleRecallService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('queries recallsByVehicle and maps the lowercase results key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sampleResponse))
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleRecallService()
    const recalls = await service.listByVehicle({
      make: 'FORD',
      model: 'F-150',
      modelYear: '2021',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      `${NHTSA_API_BASE_URL}/recalls/recallsByVehicle?make=FORD&model=F-150&modelYear=2021`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(recalls).toEqual([
      {
        campaignNumber: '21V986000',
        manufacturer: 'Ford Motor Company',
        component: 'POWER TRAIN:DRIVELINE:DRIVESHAFT',
        summary: 'Underbody insulators may contact the driveshaft.',
        consequence: 'A fractured driveshaft can cause a loss of drive power.',
        remedy: 'Dealers will inspect and repair the driveshaft.',
        notes: 'Owners may also contact the NHTSA hotline.',
        reportReceivedDate: '16/12/2021',
        parkIt: false,
        parkOutSide: false,
        overTheAirUpdate: false,
        make: 'FORD',
        model: 'F-150',
        modelYear: '2021',
      },
    ])
  })

  it('returns an empty list when results is missing', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ Count: 0, Message: 'No results' }))
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleRecallService()
    await expect(
      service.listByVehicle({
        make: 'FORD',
        model: 'F-150',
        modelYear: '2021',
      }),
    ).resolves.toEqual([])
  })

  it('defaults optional fields when NHTSA omits them', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        Count: 1,
        Message: 'Results returned successfully',
        results: [
          {
            Manufacturer: 'Ford Motor Company',
            NHTSACampaignNumber: '22V123000',
            ReportReceivedDate: '01/03/2022',
            Component: 'ENGINE',
            Summary: 'Summary',
            Consequence: 'Consequence',
            Remedy: 'Remedy',
            ModelYear: '2021',
            Make: 'FORD',
            Model: 'F-150',
          },
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleRecallService()
    const [recall] = await service.listByVehicle({
      make: 'FORD',
      model: 'F-150',
      modelYear: '2021',
    })

    expect(recall).toMatchObject({
      notes: '',
      parkIt: false,
      parkOutSide: false,
      overTheAirUpdate: false,
    })
  })

  it('rejects blank query fields before calling the API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleRecallService()
    await expect(
      service.listByVehicle({ make: 'FORD', model: ' ', modelYear: '2021' }),
    ).rejects.toThrow(
      'VehicleRecallService: make, model and modelYear are required',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws when the HTTP response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 503))
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleRecallService()
    await expect(
      service.listByVehicle({
        make: 'FORD',
        model: 'F-150',
        modelYear: '2021',
      }),
    ).rejects.toThrow('VehicleRecallService request failed: 503 Error')
  })
})
