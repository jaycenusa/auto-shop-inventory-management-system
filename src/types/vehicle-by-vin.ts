/** Flat-row fields returned by NHTSA `/vehicles/DecodeVinValues/{vin}`. */
export type VinDecodeFlatResult = {
  VIN: string
  Make: string
  Model: string
  ModelYear: string
  BodyClass: string
  BodyCabType: string
  Series: string
  Manufacturer: string
  VehicleType: string
  Trim: string
  DriveType: string
  FuelTypePrimary: string
  DisplacementL: string
  EngineCylinders: string
  ErrorCode: string
  ErrorText: string
  [key: string]: string
}

/** Envelope returned by the VPIC vehicles API. */
export type VinDecodeApiResponse = {
  Count: number
  Message: string
  SearchCriteria: string
  Results: VinDecodeFlatResult[]
}

/** Row returned by NHTSA `/vehicles/DecodeWMI/{wmi}`. */
export type WmiDecodeResult = {
  CommonName: string
  Make: string
  ManufacturerName: string
  ParentCompanyName: string
  VehicleType: string
  URL: string
}

/** Envelope returned by the VPIC WMI endpoint. */
export type WmiDecodeApiResponse = {
  Count: number
  Message: string
  SearchCriteria: string
  Results: WmiDecodeResult[]
}

/** App-facing manufacturer identified by a VIN's WMI prefix. */
export type VehicleManufacturerByWmi = {
  wmi: string
  commonName: string
  make: string
  manufacturerName: string
  parentCompanyName: string
  vehicleType: string
  url: string
}

export function mapWmiDecodeResult(
  wmi: string,
  result: WmiDecodeResult,
): VehicleManufacturerByWmi {
  return {
    wmi,
    commonName: result.CommonName ?? '',
    make: result.Make ?? '',
    manufacturerName: result.ManufacturerName ?? '',
    parentCompanyName: result.ParentCompanyName ?? '',
    vehicleType: result.VehicleType ?? '',
    url: result.URL ?? '',
  }
}

/** App-facing vehicle decoded from a VIN. */
export type VehicleByVin = {
  vin: string
  make: string
  model: string
  modelYear: string
  bodyClass: string
  /** e.g. `Crew/Super Crew/Crew Max`; disambiguates safety-rating models. */
  bodyCabType: string
  series: string
  manufacturer: string
  vehicleType: string
  trim: string
  driveType: string
  fuelTypePrimary: string
  displacementL: string
  engineCylinders: string
  errorCode: string
  errorText: string
}

export function mapVinDecodeFlatResult(
  result: VinDecodeFlatResult,
): VehicleByVin {
  return {
    vin: result.VIN,
    make: result.Make,
    model: result.Model,
    modelYear: result.ModelYear,
    bodyClass: result.BodyClass,
    bodyCabType: result.BodyCabType ?? '',
    series: result.Series ?? '',
    manufacturer: result.Manufacturer,
    vehicleType: result.VehicleType,
    trim: result.Trim,
    driveType: result.DriveType,
    fuelTypePrimary: result.FuelTypePrimary,
    displacementL: result.DisplacementL,
    engineCylinders: result.EngineCylinders,
    errorCode: result.ErrorCode,
    errorText: result.ErrorText,
  }
}
