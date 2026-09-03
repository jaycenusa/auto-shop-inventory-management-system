/** Row returned by NHTSA `/recalls/recallsByVehicle`. */
export type VehicleRecallResponse = {
  Manufacturer: string
  NHTSACampaignNumber: string
  parkIt?: boolean
  parkOutSide?: boolean
  overTheAirUpdate?: boolean
  /** Formatted `DD/MM/YYYY`, unlike the ISO dates used elsewhere. */
  ReportReceivedDate: string
  Component: string
  Summary: string
  Consequence: string
  Remedy: string
  Notes?: string
  ModelYear: string
  Make: string
  Model: string
}

/** Envelope of the recalls API; note the lowercase `results` key. */
export type VehicleRecallApiResponse = {
  Count: number
  Message: string
  results: VehicleRecallResponse[]
}

/** App-facing recall for a decoded vehicle. */
export type VehicleRecall = {
  campaignNumber: string
  manufacturer: string
  component: string
  summary: string
  consequence: string
  remedy: string
  notes: string
  /** As reported by NHTSA, in `DD/MM/YYYY` form. */
  reportReceivedDate: string
  parkIt: boolean
  parkOutSide: boolean
  overTheAirUpdate: boolean
  make: string
  model: string
  modelYear: string
}

export function mapVehicleRecallResponse(
  response: VehicleRecallResponse,
): VehicleRecall {
  return {
    campaignNumber: response.NHTSACampaignNumber,
    manufacturer: response.Manufacturer,
    component: response.Component,
    summary: response.Summary,
    consequence: response.Consequence,
    remedy: response.Remedy,
    notes: response.Notes ?? '',
    reportReceivedDate: response.ReportReceivedDate,
    parkIt: response.parkIt ?? false,
    parkOutSide: response.parkOutSide ?? false,
    overTheAirUpdate: response.overTheAirUpdate ?? false,
    make: response.Make,
    model: response.Model,
    modelYear: response.ModelYear,
  }
}
