import { NHTSA_API_BASE_URL } from '../constant/nhtsa'
import { externalJsonFetch } from './http'
import {
  resolveSafetyRatingsModel,
  toSafetyRatingsQuery,
  type SafetyRatingsQuery,
} from './vin-request-mapping'
import type { VehicleByVin } from '../types/vehicle-by-vin'
import {
  mapSafetyRatingsDetailResponse,
  type SafetyRatingsApiResponse,
  type SafetyRatingsDetailResponse,
  type SafetyRatingsModelResponse,
  type SafetyRatingsVehicleResponse,
  type VehicleSafetyRatingLookup,
  type VehicleSafetyRatingVariant,
} from '../types/vehicle-safety-rating'

const SAFETY_RATINGS_PATH = '/SafetyRatings'

async function fetchSafetyRatings<T>(
  path: string,
): Promise<SafetyRatingsApiResponse<T>> {
  return externalJsonFetch<SafetyRatingsApiResponse<T>>(
    `${NHTSA_API_BASE_URL}${SAFETY_RATINGS_PATH}${path}`,
    { serviceName: 'VehicleSafetyRatingService' },
  )
}

/**
 * NHTSA 5-Star Safety Ratings. The API keys vehicles by its own model names
 * (`F-150 SUPER CREW`) and numeric ids, so a lookup takes three calls:
 * models for the year/make, vehicle ids for the model, then the ratings.
 * @see https://api.nhtsa.gov/SafetyRatings
 */
export class VehicleSafetyRatingService {
  /** Model names NHTSA rated for a model year and make. */
  async listModels(query: {
    modelYear: string
    make: string
  }): Promise<string[]> {
    const data = await fetchSafetyRatings<SafetyRatingsModelResponse>(
      `/modelyear/${encodeURIComponent(query.modelYear)}` +
        `/make/${encodeURIComponent(query.make)}`,
    )
    return (data.Results ?? []).map(result => result.Model)
  }

  /** Tested variants (drivetrain/body) of one NHTSA model name. */
  async listVehicleIds(
    query: SafetyRatingsQuery,
  ): Promise<SafetyRatingsVehicleResponse[]> {
    const data = await fetchSafetyRatings<SafetyRatingsVehicleResponse>(
      `/modelyear/${encodeURIComponent(query.modelYear)}` +
        `/make/${encodeURIComponent(query.make)}` +
        `/model/${encodeURIComponent(query.model)}`,
    )
    return data.Results ?? []
  }

  /** Ratings for a single NHTSA vehicle id. */
  async getByVehicleId(vehicleId: number) {
    const data = await fetchSafetyRatings<SafetyRatingsDetailResponse>(
      `/VehicleId/${encodeURIComponent(String(vehicleId))}`,
    )
    const first = data.Results?.[0]
    if (!first) {
      throw new Error(
        `VehicleSafetyRatingService: no ratings for vehicle id ${vehicleId}`,
      )
    }
    return mapSafetyRatingsDetailResponse(first)
  }

  /**
   * Run the full chain for a decoded vehicle. Resolves to an empty lookup
   * rather than throwing when NHTSA has not rated the vehicle.
   */
  async findByVehicle(
    vehicle: VehicleByVin,
  ): Promise<VehicleSafetyRatingLookup> {
    const query = toSafetyRatingsQuery(vehicle)
    if (!query) {
      throw new Error(
        'VehicleSafetyRatingService: make, model and modelYear are required',
      )
    }

    const models = await this.listModels(query)
    const { resolvedModel, candidates } = resolveSafetyRatingsModel(
      query.model,
      models,
      {
        bodyCabType: vehicle.bodyCabType,
        fuelTypePrimary: vehicle.fuelTypePrimary,
      },
    )
    if (!resolvedModel) {
      return { resolvedModel: null, candidateModels: candidates, variants: [] }
    }

    const vehicles = await this.listVehicleIds({
      ...query,
      model: resolvedModel,
    })
    const variants: VehicleSafetyRatingVariant[] = await Promise.all(
      vehicles.map(async entry => ({
        vehicleId: entry.VehicleId,
        description: entry.VehicleDescription,
        ratings: await this.getByVehicleId(entry.VehicleId),
      })),
    )

    return { resolvedModel, candidateModels: candidates, variants }
  }
}

export const vehicleSafetyRatingService = new VehicleSafetyRatingService()
