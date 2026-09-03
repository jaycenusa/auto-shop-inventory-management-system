import { describe, expect, it } from 'vitest'
import {
  resolveSafetyRatingsModel,
  toPartListFilters,
  toRecallQuery,
  toSafetyRatingsQuery,
  toVehicleLabel,
} from '../service/vin-request-mapping'
import type { VehicleByVin } from '../types/vehicle-by-vin'

/** Fields as decoded from VIN 1FTFW1E50MFA00001 by vPIC. */
const f150SuperCrew: VehicleByVin = {
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

/** SafetyRatings model names for modelyear 2021 / make ford. */
const fordSafetyModels2021 = [
  'BRONCO',
  'EXPEDITION',
  'F-150 REGULAR CAB',
  'F-150 SUPER CAB',
  'F-150 SUPER CAB DIESEL',
  'F-150 SUPER CREW',
  'F-150 SUPER CREW DIESEL',
  'F-150 SUPER CREW HEV',
  'F-250 CREW CAB',
]

describe('toRecallQuery', () => {
  it('maps the decoded make, model and year', () => {
    expect(toRecallQuery(f150SuperCrew)).toEqual({
      make: 'FORD',
      model: 'F-150',
      modelYear: '2021',
    })
  })

  it('returns null when any field is blank', () => {
    expect(toRecallQuery({ ...f150SuperCrew, model: '' })).toBeNull()
    expect(toRecallQuery({ ...f150SuperCrew, make: '  ' })).toBeNull()
    expect(toRecallQuery({ ...f150SuperCrew, modelYear: '' })).toBeNull()
  })
})

describe('toSafetyRatingsQuery', () => {
  it('maps the decoded fields', () => {
    expect(toSafetyRatingsQuery(f150SuperCrew)).toEqual({
      modelYear: '2021',
      make: 'FORD',
      model: 'F-150',
    })
  })

  it('returns null when the decode is incomplete', () => {
    expect(toSafetyRatingsQuery({ ...f150SuperCrew, model: '' })).toBeNull()
  })
})

describe('resolveSafetyRatingsModel', () => {
  it('prefers an exact match', () => {
    expect(
      resolveSafetyRatingsModel('bronco', fordSafetyModels2021),
    ).toEqual({ resolvedModel: 'BRONCO', candidates: ['BRONCO'] })
  })

  it('resolves F-150 to the crew cab variant using the cab hint', () => {
    const resolution = resolveSafetyRatingsModel(
      'F-150',
      fordSafetyModels2021,
      {
        bodyCabType: f150SuperCrew.bodyCabType,
        fuelTypePrimary: f150SuperCrew.fuelTypePrimary,
      },
    )

    expect(resolution.resolvedModel).toBe('F-150 SUPER CREW')
    expect(resolution.candidates).toEqual([
      'F-150 REGULAR CAB',
      'F-150 SUPER CAB',
      'F-150 SUPER CAB DIESEL',
      'F-150 SUPER CREW',
      'F-150 SUPER CREW DIESEL',
      'F-150 SUPER CREW HEV',
    ])
  })

  it('resolves a regular cab from the cab hint', () => {
    expect(
      resolveSafetyRatingsModel('F-150', fordSafetyModels2021, {
        bodyCabType: 'Regular',
        fuelTypePrimary: 'Gasoline',
      }).resolvedModel,
    ).toBe('F-150 REGULAR CAB')
  })

  it('keeps the diesel variant when the decode reports diesel', () => {
    expect(
      resolveSafetyRatingsModel('F-150', fordSafetyModels2021, {
        bodyCabType: 'Crew/Super Crew/Crew Max',
        fuelTypePrimary: 'Diesel',
      }).resolvedModel,
    ).toBe('F-150 SUPER CREW DIESEL')
  })

  it('falls back to the shortest prefix match without hints', () => {
    expect(
      resolveSafetyRatingsModel('F-250', fordSafetyModels2021).resolvedModel,
    ).toBe('F-250 CREW CAB')
  })

  it('returns null when nothing matches', () => {
    expect(resolveSafetyRatingsModel('TAURUS', fordSafetyModels2021)).toEqual({
      resolvedModel: null,
      candidates: [],
    })
    expect(resolveSafetyRatingsModel('', fordSafetyModels2021)).toEqual({
      resolvedModel: null,
      candidates: [],
    })
  })
})

describe('toPartListFilters', () => {
  it('searches by make and model, with a drivetrain category hint', () => {
    expect(toPartListFilters(f150SuperCrew)).toEqual({
      search: 'FORD F-150',
      category: 'Transmission',
    })
  })

  it('maps electric powertrains to Electrical', () => {
    expect(
      toPartListFilters({
        ...f150SuperCrew,
        fuelTypePrimary: 'Electric',
        driveType: '4x2',
      }),
    ).toEqual({ search: 'FORD F-150', category: 'Electrical' })
  })

  it('maps diesel powertrains to Engine', () => {
    expect(
      toPartListFilters({
        ...f150SuperCrew,
        fuelTypePrimary: 'Diesel',
        driveType: '4x2',
      }),
    ).toEqual({ search: 'FORD F-150', category: 'Engine' })
  })

  it('omits keys it cannot derive', () => {
    expect(
      toPartListFilters({
        ...f150SuperCrew,
        make: '',
        model: '',
        fuelTypePrimary: '',
        driveType: '',
      }),
    ).toEqual({})
  })
})

describe('toVehicleLabel', () => {
  it('joins year, make and model', () => {
    expect(toVehicleLabel(f150SuperCrew)).toBe('2021 FORD F-150')
  })

  it('skips blank fields', () => {
    expect(toVehicleLabel({ ...f150SuperCrew, modelYear: '' })).toBe(
      'FORD F-150',
    )
  })
})
