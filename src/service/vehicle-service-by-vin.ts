import { externalJsonFetch } from './http'
import { WMI_LENGTH, normalizeVin } from '../utils/vin'
import {
  mapVinDecodeFlatResult,
  mapWmiDecodeResult,
  type VehicleByVin,
  type VehicleManufacturerByWmi,
  type VinDecodeApiResponse,
  type WmiDecodeApiResponse,
} from '../types/vehicle-by-vin'

/** NHTSA Product Information Catalog Vehicle Listing (vPIC) vehicles API. */
export const VPIC_VEHICLES_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles'

export type DecodeVinOptions = {
  /** Optional model year to improve decode accuracy. */
  modelYear?: number | string
}

async function fetchVpicVehiclesApi<T>(path: string): Promise<T> {
  return externalJsonFetch<T>(`${VPIC_VEHICLES_BASE_URL}${path}`, {
    serviceName: 'VehicleServiceByVin',
  })
}

/**
 * Looks up vehicle details by VIN via the NHTSA vPIC Vehicles API.
 * @see https://vpic.nhtsa.dot.gov/api
 */
export class VehicleServiceByVin {
  /**
   * Decode a VIN (full or partial) into flat vehicle attributes.
   * Uses `GET /vehicles/DecodeVinValues/{vin}?format=json`.
   */
  async decodeByVin(
    vin: string,
    options: DecodeVinOptions = {},
  ): Promise<VehicleByVin> {
    const trimmed = normalizeVin(vin)
    if (!trimmed) {
      throw new Error('VehicleServiceByVin: VIN is required')
    }

    const params = new URLSearchParams({ format: 'json' })
    if (options.modelYear !== undefined && options.modelYear !== '') {
      params.set('modelyear', String(options.modelYear))
    }

    const path = `/DecodeVinValues/${encodeURIComponent(trimmed)}?${params}`
    const data = await fetchVpicVehiclesApi<VinDecodeApiResponse>(path)
    const first = data.Results?.[0]
    if (!first) {
      throw new Error('VehicleServiceByVin: no decode results returned')
    }

    return mapVinDecodeFlatResult(first)
  }

  /**
   * Identify the manufacturer from a VIN's World Manufacturer Identifier.
   * Useful as a fallback when a full decode fails or returns no make.
   * Uses `GET /vehicles/DecodeWMI/{wmi}?format=json`.
   */
  async decodeWmi(wmi: string): Promise<VehicleManufacturerByWmi> {
    const normalized = normalizeVin(wmi).slice(0, WMI_LENGTH)
    if (normalized.length < WMI_LENGTH) {
      throw new Error(
        `VehicleServiceByVin: WMI must be ${WMI_LENGTH} characters`,
      )
    }

    const path = `/DecodeWMI/${encodeURIComponent(normalized)}?format=json`
    const data = await fetchVpicVehiclesApi<WmiDecodeApiResponse>(path)
    const first = data.Results?.[0]
    if (!first) {
      throw new Error('VehicleServiceByVin: no WMI results returned')
    }

    return mapWmiDecodeResult(normalized, first)
  }
}

export const vehicleServiceByVin = new VehicleServiceByVin()
