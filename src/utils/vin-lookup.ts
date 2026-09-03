import { MAX_RECENT_VINS } from '../constant/vehicles'
import type { Part } from '../types/part'
import type { VehicleByVin } from '../types/vehicle-by-vin'

/** Vehicle shown on the VIN Lookup page, from a decode or manual entry. */
export type LookupVehicle = {
  vin: string
  make: string
  model: string
  year: string
  cylinders: string
}

/** Shown when vPIC reports no cylinder count. */
export const UNKNOWN_CYLINDERS = 'N/A'

export function toLookupVehicle(vehicle: VehicleByVin): LookupVehicle {
  return {
    vin: vehicle.vin,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.modelYear,
    cylinders: vehicle.engineCylinders || UNKNOWN_CYLINDERS,
  }
}

/** A decode is only usable once vPIC returned a make, model and year. */
export function isUsableDecode(vehicle: VehicleByVin): boolean {
  return (
    vehicle.make.trim() !== '' &&
    vehicle.model.trim() !== '' &&
    vehicle.modelYear.trim() !== ''
  )
}

/** Build a vehicle from the brand/model/year selects, or `null` if partial. */
export function toManualVehicle(
  brand: string,
  model: string,
  year: string,
): LookupVehicle | null {
  if (!brand.trim() || !model.trim() || year.trim().length !== 4) return null
  return {
    vin: '',
    make: brand,
    model,
    year,
    cylinders: UNKNOWN_CYLINDERS,
  }
}

/** `2021 FORD F-150`, skipping anything the lookup could not determine. */
export function toLookupVehicleLabel(vehicle: LookupVehicle): string {
  return [vehicle.year, vehicle.make, vehicle.model]
    .map(part => part.trim())
    .filter(part => part !== '')
    .join(' ')
}

export type LookupPartFilters = {
  search?: string
  category?: string
  inStockOnly?: boolean
}

/** Client-side name/SKU, category and availability filtering for the table. */
export function filterLookupParts(
  parts: Part[],
  { search = '', category = 'All', inStockOnly = false }: LookupPartFilters = {},
): Part[] {
  const query = search.trim().toLowerCase()
  return parts.filter(part => {
    const matchesQuery =
      query === '' ||
      part.name.toLowerCase().includes(query) ||
      part.sku.toLowerCase().includes(query)
    const matchesCategory = category === 'All' || part.category === category
    const matchesStock = !inStockOnly || part.stock > 0
    return matchesQuery && matchesCategory && matchesStock
  })
}

/** Most recent decode first, de-duplicated by VIN and capped. */
export function addRecentVehicle(
  recent: LookupVehicle[],
  vehicle: LookupVehicle,
  max: number = MAX_RECENT_VINS,
): LookupVehicle[] {
  const withoutDuplicate = recent.filter(entry => entry.vin !== vehicle.vin)
  return [vehicle, ...withoutDuplicate].slice(0, max)
}
