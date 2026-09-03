import { describe, expect, it } from 'vitest'
import { vehicleYears } from '../constant/vehicles'
import type { Part } from '../types/part'
import type { VehicleByVin } from '../types/vehicle-by-vin'
import {
  addRecentVehicle,
  filterLookupParts,
  isUsableDecode,
  toLookupVehicle,
  toLookupVehicleLabel,
  toManualVehicle,
  type LookupVehicle,
} from '../utils/vin-lookup'

const decodedF150: VehicleByVin = {
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

function part(overrides: Partial<Part> = {}): Part {
  return {
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
    ...overrides,
  }
}

describe('toLookupVehicle', () => {
  it('maps the decoded fields the page renders', () => {
    expect(toLookupVehicle(decodedF150)).toEqual({
      vin: '1FTFW1E50MFA00001',
      make: 'FORD',
      model: 'F-150',
      year: '2021',
      cylinders: '8',
    })
  })

  it('falls back to N/A when vPIC omits the cylinder count', () => {
    expect(toLookupVehicle({ ...decodedF150, engineCylinders: '' }).cylinders).toBe(
      'N/A',
    )
  })
})

describe('isUsableDecode', () => {
  it('accepts a decode with make, model and year', () => {
    expect(isUsableDecode(decodedF150)).toBe(true)
  })

  it('rejects a decode missing any identifying field', () => {
    expect(isUsableDecode({ ...decodedF150, make: '' })).toBe(false)
    expect(isUsableDecode({ ...decodedF150, model: '  ' })).toBe(false)
    expect(isUsableDecode({ ...decodedF150, modelYear: '' })).toBe(false)
  })
})

describe('toManualVehicle', () => {
  it('builds a VIN-less vehicle from the selects', () => {
    expect(toManualVehicle('Ford', 'F-150', '2021')).toEqual({
      vin: '',
      make: 'Ford',
      model: 'F-150',
      year: '2021',
      cylinders: 'N/A',
    })
  })

  it('returns null until brand, model and a 4-digit year are chosen', () => {
    expect(toManualVehicle('', 'F-150', '2021')).toBeNull()
    expect(toManualVehicle('Ford', '', '2021')).toBeNull()
    expect(toManualVehicle('Ford', 'F-150', '')).toBeNull()
    expect(toManualVehicle('Ford', 'F-150', '21')).toBeNull()
  })
})

describe('toLookupVehicleLabel', () => {
  it('reads year make model', () => {
    expect(toLookupVehicleLabel(toLookupVehicle(decodedF150))).toBe(
      '2021 FORD F-150',
    )
  })

  it('skips fields the lookup could not determine', () => {
    expect(
      toLookupVehicleLabel({
        vin: '',
        make: 'Ford',
        model: 'F-150',
        year: '',
        cylinders: 'N/A',
      }),
    ).toBe('Ford F-150')
  })
})

describe('filterLookupParts', () => {
  const parts = [
    part(),
    part({ id: 'p2', sku: 'ENG-OIL-001', name: 'Oil Filter', category: 'Engine' }),
    part({ id: 'p3', sku: 'SUS-STR-001', name: 'Strut Assembly', category: 'Suspension', stock: 0 }),
  ]

  it('returns everything by default', () => {
    expect(filterLookupParts(parts)).toHaveLength(3)
  })

  it('matches the search against name and SKU, case-insensitively', () => {
    expect(filterLookupParts(parts, { search: 'oil' }).map(p => p.id)).toEqual(['p2'])
    expect(filterLookupParts(parts, { search: 'sus-str' }).map(p => p.id)).toEqual(['p3'])
  })

  it('filters by category, treating All as no filter', () => {
    expect(filterLookupParts(parts, { category: 'Engine' }).map(p => p.id)).toEqual(['p2'])
    expect(filterLookupParts(parts, { category: 'All' })).toHaveLength(3)
  })

  it('drops out-of-stock parts when in-stock only is on', () => {
    expect(filterLookupParts(parts, { inStockOnly: true }).map(p => p.id)).toEqual([
      'p1',
      'p2',
    ])
  })

  it('combines every filter', () => {
    expect(
      filterLookupParts(parts, {
        search: 'assembly',
        category: 'Suspension',
        inStockOnly: true,
      }),
    ).toEqual([])
  })
})

describe('addRecentVehicle', () => {
  const vehicle = (vin: string): LookupVehicle => ({
    vin,
    make: 'FORD',
    model: 'F-150',
    year: '2021',
    cylinders: '8',
  })

  it('puts the newest lookup first', () => {
    const result = addRecentVehicle([vehicle('A')], vehicle('B'))
    expect(result.map(v => v.vin)).toEqual(['B', 'A'])
  })

  it('moves a repeated VIN to the front instead of duplicating it', () => {
    const result = addRecentVehicle([vehicle('A'), vehicle('B')], vehicle('B'))
    expect(result.map(v => v.vin)).toEqual(['B', 'A'])
  })

  it('caps the list', () => {
    const existing = ['A', 'B', 'C', 'D', 'E'].map(vehicle)
    expect(addRecentVehicle(existing, vehicle('F'))).toHaveLength(5)
    expect(addRecentVehicle(existing, vehicle('F'), 2).map(v => v.vin)).toEqual([
      'F',
      'A',
    ])
  })
})

describe('vehicleYears', () => {
  it('lists model years newest first back to 2000', () => {
    const years = vehicleYears(new Date('2026-09-02T00:00:00Z'))
    expect(years[0]).toBe('2026')
    expect(years.at(-1)).toBe('2000')
    expect(years).toHaveLength(27)
  })
})
