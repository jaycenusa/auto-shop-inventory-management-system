/** Envelope shared by every NHTSA `/SafetyRatings` response. */
export type SafetyRatingsApiResponse<T> = {
  Count: number
  Message: string
  Results: T[]
}

/** Row from `/SafetyRatings/modelyear/{year}/make/{make}`. */
export type SafetyRatingsModelResponse = {
  ModelYear: number
  Make: string
  Model: string
  VehicleId: number
}

/** Row from `/SafetyRatings/modelyear/{year}/make/{make}/model/{model}`. */
export type SafetyRatingsVehicleResponse = {
  VehicleDescription: string
  VehicleId: number
}

/** Row from `/SafetyRatings/VehicleId/{id}`. */
export type SafetyRatingsDetailResponse = {
  VehicleId: number
  VehicleDescription: string
  ModelYear: number
  Make: string
  Model: string
  OverallRating: string
  OverallFrontCrashRating: string
  FrontCrashDriversideRating: string
  FrontCrashPassengersideRating: string
  OverallSideCrashRating: string
  SideCrashDriversideRating: string
  SideCrashPassengersideRating: string
  SidePoleCrashRating: string
  RolloverRating: string
  RolloverPossibility: number
  FrontCrashPicture?: string
  SideCrashPicture?: string
  SidePolePicture?: string
  NHTSAElectronicStabilityControl?: string
  NHTSAForwardCollisionWarning?: string
  NHTSALaneDepartureWarning?: string
  ComplaintsCount?: number
  RecallsCount?: number
  InvestigationCount?: number
}

/** App-facing safety ratings for one tested vehicle variant. */
export type VehicleSafetyRating = {
  vehicleId: number
  vehicleDescription: string
  make: string
  model: string
  modelYear: string
  overallRating: string
  overallFrontCrashRating: string
  frontCrashDriverSideRating: string
  frontCrashPassengerSideRating: string
  overallSideCrashRating: string
  sideCrashDriverSideRating: string
  sideCrashPassengerSideRating: string
  sidePoleCrashRating: string
  rolloverRating: string
  rolloverPossibility: number
  frontCrashPicture: string
  sideCrashPicture: string
  sidePolePicture: string
  electronicStabilityControl: string
  forwardCollisionWarning: string
  laneDepartureWarning: string
  complaintsCount: number
  recallsCount: number
  investigationCount: number
}

/** One SafetyRatings variant (e.g. 4WD vs 2WD) of a resolved model. */
export type VehicleSafetyRatingVariant = {
  vehicleId: number
  description: string
  ratings: VehicleSafetyRating
}

/** Result of the model-resolution + ratings lookup chain. */
export type VehicleSafetyRatingLookup = {
  /** SafetyRatings model name the vPIC model resolved to. */
  resolvedModel: string | null
  /** Every SafetyRatings model that matched the vPIC model. */
  candidateModels: string[]
  variants: VehicleSafetyRatingVariant[]
}

export function mapSafetyRatingsDetailResponse(
  response: SafetyRatingsDetailResponse,
): VehicleSafetyRating {
  return {
    vehicleId: response.VehicleId,
    vehicleDescription: response.VehicleDescription,
    make: response.Make,
    model: response.Model,
    modelYear: String(response.ModelYear),
    overallRating: response.OverallRating,
    overallFrontCrashRating: response.OverallFrontCrashRating,
    frontCrashDriverSideRating: response.FrontCrashDriversideRating,
    frontCrashPassengerSideRating: response.FrontCrashPassengersideRating,
    overallSideCrashRating: response.OverallSideCrashRating,
    sideCrashDriverSideRating: response.SideCrashDriversideRating,
    sideCrashPassengerSideRating: response.SideCrashPassengersideRating,
    sidePoleCrashRating: response.SidePoleCrashRating,
    rolloverRating: response.RolloverRating,
    rolloverPossibility: response.RolloverPossibility,
    frontCrashPicture: response.FrontCrashPicture ?? '',
    sideCrashPicture: response.SideCrashPicture ?? '',
    sidePolePicture: response.SidePolePicture ?? '',
    electronicStabilityControl: response.NHTSAElectronicStabilityControl ?? '',
    forwardCollisionWarning: response.NHTSAForwardCollisionWarning ?? '',
    laneDepartureWarning: response.NHTSALaneDepartureWarning ?? '',
    complaintsCount: response.ComplaintsCount ?? 0,
    recallsCount: response.RecallsCount ?? 0,
    investigationCount: response.InvestigationCount ?? 0,
  }
}
