import { NHTSA_API_BASE_URL } from '../constant/nhtsa'
import { externalJsonFetch } from './http'
import type { RecallQuery } from './vin-request-mapping'
import {
  mapVehicleRecallResponse,
  type VehicleRecall,
  type VehicleRecallApiResponse,
} from '../types/vehicle-recall'

export type { RecallQuery }

/**
 * Safety recalls for a vehicle, keyed by the make/model/year a VIN decodes to.
 * @see https://api.nhtsa.gov/recalls/recallsByVehicle
 */
export class VehicleRecallService {
  async listByVehicle(query: RecallQuery): Promise<VehicleRecall[]> {
    const make = query.make.trim()
    const model = query.model.trim()
    const modelYear = String(query.modelYear).trim()
    if (!make || !model || !modelYear) {
      throw new Error(
        'VehicleRecallService: make, model and modelYear are required',
      )
    }

    const params = new URLSearchParams({ make, model, modelYear })
    const data = await externalJsonFetch<VehicleRecallApiResponse>(
      `${NHTSA_API_BASE_URL}/recalls/recallsByVehicle?${params}`,
      { serviceName: 'VehicleRecallService' },
    )

    return (data.results ?? []).map(mapVehicleRecallResponse)
  }
}

export const vehicleRecallService = new VehicleRecallService()
