import { afterEach, describe, expect, it, vi } from 'vitest'
import { NHTSA_API_BASE_URL } from '../constant/nhtsa'
import { VehicleSafetyRatingService } from '../service/vehicle-safety-rating-service'
import type { VehicleByVin } from '../types/vehicle-by-vin'

const vehicle: VehicleByVin = {
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
  errorText: '0 - VIN decoded clean',
}

const modelsResponse = {
  Count: 3,
  Message: 'Results returned successfully',
  Results: [
    { ModelYear: 2021, Make: 'FORD', Model: 'F-150 REGULAR CAB', VehicleId: 0 },
    { ModelYear: 2021, Make: 'FORD', Model: 'F-150 SUPER CAB', VehicleId: 0 },
    { ModelYear: 2021, Make: 'FORD', Model: 'F-150 SUPER CREW', VehicleId: 0 },
  ],
}

const vehicleIdsResponse = {
  Count: 1,
  Message: 'Results returned successfully',
  Results: [
    {
      VehicleDescription: '2021 Ford F-150 Super Crew PU/CC 4WD',
      VehicleId: 15428,
    },
  ],
}

const detailResponse = {
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
      FrontCrashPicture: 'https://static.nhtsa.gov/front.JPG',
      ComplaintsCount: 992,
      RecallsCount: 29,
      InvestigationCount: 1,
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

function urlOf(call: unknown[]): string {
  return String(call[0])
}

describe('VehicleSafetyRatingService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('runs the model, vehicle id and ratings chain', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(modelsResponse))
      .mockResolvedValueOnce(jsonResponse(vehicleIdsResponse))
      .mockResolvedValueOnce(jsonResponse(detailResponse))
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleSafetyRatingService()
    const lookup = await service.findByVehicle(vehicle)

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(urlOf(fetchMock.mock.calls[0])).toBe(
      `${NHTSA_API_BASE_URL}/SafetyRatings/modelyear/2021/make/FORD`,
    )
    expect(urlOf(fetchMock.mock.calls[1])).toBe(
      `${NHTSA_API_BASE_URL}/SafetyRatings/modelyear/2021/make/FORD/model/F-150%20SUPER%20CREW`,
    )
    expect(urlOf(fetchMock.mock.calls[2])).toBe(
      `${NHTSA_API_BASE_URL}/SafetyRatings/VehicleId/15428`,
    )

    expect(lookup.resolvedModel).toBe('F-150 SUPER CREW')
    expect(lookup.candidateModels).toEqual([
      'F-150 REGULAR CAB',
      'F-150 SUPER CAB',
      'F-150 SUPER CREW',
    ])
    expect(lookup.variants).toEqual([
      {
        vehicleId: 15428,
        description: '2021 Ford F-150 Super Crew PU/CC 4WD',
        ratings: {
          vehicleId: 15428,
          vehicleDescription: '2021 Ford F-150 Super Crew PU/CC 4WD',
          make: 'FORD',
          model: 'F-150 SUPER CREW',
          modelYear: '2021',
          overallRating: '5',
          overallFrontCrashRating: '5',
          frontCrashDriverSideRating: '5',
          frontCrashPassengerSideRating: '5',
          overallSideCrashRating: '5',
          sideCrashDriverSideRating: '5',
          sideCrashPassengerSideRating: '5',
          sidePoleCrashRating: '5',
          rolloverRating: '4',
          rolloverPossibility: 0.191,
          frontCrashPicture: 'https://static.nhtsa.gov/front.JPG',
          sideCrashPicture: '',
          sidePolePicture: '',
          electronicStabilityControl: '',
          forwardCollisionWarning: '',
          laneDepartureWarning: '',
          complaintsCount: 992,
          recallsCount: 29,
          investigationCount: 1,
        },
      },
    ])
  })

  it('stops after the model call when nothing resolves', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        Count: 1,
        Message: 'Results returned successfully',
        Results: [
          { ModelYear: 2021, Make: 'FORD', Model: 'BRONCO', VehicleId: 0 },
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleSafetyRatingService()
    const lookup = await service.findByVehicle(vehicle)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(lookup).toEqual({
      resolvedModel: null,
      candidateModels: [],
      variants: [],
    })
  })

  it('rejects an incomplete decode before calling the API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleSafetyRatingService()
    await expect(
      service.findByVehicle({ ...vehicle, model: '' }),
    ).rejects.toThrow(
      'VehicleSafetyRatingService: make, model and modelYear are required',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws when a chained response is not ok', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(modelsResponse))
      .mockResolvedValueOnce(jsonResponse({}, 503))
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleSafetyRatingService()
    await expect(service.findByVehicle(vehicle)).rejects.toThrow(
      'VehicleSafetyRatingService request failed: 503 Error',
    )
  })

  it('throws when a vehicle id has no ratings row', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(modelsResponse))
      .mockResolvedValueOnce(jsonResponse(vehicleIdsResponse))
      .mockResolvedValueOnce(
        jsonResponse({ Count: 0, Message: 'No results', Results: [] }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const service = new VehicleSafetyRatingService()
    await expect(service.findByVehicle(vehicle)).rejects.toThrow(
      'VehicleSafetyRatingService: no ratings for vehicle id 15428',
    )
  })
})
