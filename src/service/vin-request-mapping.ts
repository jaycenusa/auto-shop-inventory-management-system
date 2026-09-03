import type { PartListFilters } from './part-service'
import type { VehicleByVin } from '../types/vehicle-by-vin'

/** Query accepted by `/recalls/recallsByVehicle`. */
export type RecallQuery = {
  make: string
  model: string
  modelYear: string
}

/** Query accepted by the `/SafetyRatings` model lookup. */
export type SafetyRatingsQuery = {
  modelYear: string
  make: string
  model: string
}

export type SafetyRatingsModelResolution = {
  /** Name to use in the SafetyRatings path, or `null` when nothing matched. */
  resolvedModel: string | null
  /** Every model that matched the vPIC model as a whole-word prefix. */
  candidates: string[]
}

/** Part categories offered by the AutoShop inventory. */
export const PART_CATEGORIES = [
  'Engine',
  'Brakes',
  'Suspension',
  'Electrical',
  'Transmission',
] as const

export type PartCategory = (typeof PART_CATEGORIES)[number]

function normalizeName(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, ' ')
}

function isBlank(value: string): boolean {
  return value.trim() === ''
}

/** `{ make, model, modelYear }` for the recalls API, or `null` if incomplete. */
export function toRecallQuery(vehicle: VehicleByVin): RecallQuery | null {
  if (isBlank(vehicle.make) || isBlank(vehicle.model) || isBlank(vehicle.modelYear)) {
    return null
  }

  return {
    make: vehicle.make.trim(),
    model: vehicle.model.trim(),
    modelYear: vehicle.modelYear.trim(),
  }
}

/** Inputs for the SafetyRatings lookup chain, or `null` if incomplete. */
export function toSafetyRatingsQuery(
  vehicle: VehicleByVin,
): SafetyRatingsQuery | null {
  const recallQuery = toRecallQuery(vehicle)
  if (!recallQuery) return null

  return {
    modelYear: recallQuery.modelYear,
    make: recallQuery.make,
    model: recallQuery.model,
  }
}

/** Cab variants SafetyRatings appends to truck model names. */
const CAB_VARIANTS: ReadonlyArray<{ suffix: string; cabKeywords: string[] }> = [
  { suffix: 'SUPER CREW', cabKeywords: ['CREW'] },
  { suffix: 'REGULAR CAB', cabKeywords: ['REGULAR'] },
  {
    suffix: 'SUPER CAB',
    cabKeywords: ['EXTRA', 'QUAD', 'DOUBLE', 'KING', 'EXTENDED'],
  },
]

/** SafetyRatings suffixes that only apply to a matching powertrain. */
const POWERTRAIN_SUFFIXES: ReadonlyArray<{
  suffix: string
  fuelKeywords: string[]
}> = [
  { suffix: 'DIESEL', fuelKeywords: ['DIESEL'] },
  { suffix: 'PHEV', fuelKeywords: ['ELECTRIC'] },
  { suffix: 'HEV', fuelKeywords: ['ELECTRIC'] },
]

function cabSuffixForVehicle(bodyCabType: string): string | null {
  const cab = normalizeName(bodyCabType)
  if (!cab) return null
  const match = CAB_VARIANTS.find(variant =>
    variant.cabKeywords.some(keyword => cab.includes(keyword)),
  )
  return match?.suffix ?? null
}

function scoreCandidate(
  candidate: string,
  expectedCabSuffix: string | null,
  fuelTypePrimary: string,
): number {
  const name = normalizeName(candidate)
  const fuel = normalizeName(fuelTypePrimary)
  let score = 0

  for (const variant of CAB_VARIANTS) {
    if (!name.includes(variant.suffix)) continue
    score += variant.suffix === expectedCabSuffix ? 4 : -2
  }

  for (const { suffix, fuelKeywords } of POWERTRAIN_SUFFIXES) {
    if (!name.endsWith(` ${suffix}`)) continue
    const fuelMatches = fuelKeywords.some(keyword => fuel.includes(keyword))
    score += fuelMatches ? 3 : -3
  }

  return score
}

/**
 * vPIC reports `F-150` while SafetyRatings names the same truck
 * `F-150 SUPER CREW`, so prefix candidates are ranked using the decoded cab
 * type and fuel before falling back to the shortest, earliest match.
 */
export function resolveSafetyRatingsModel(
  vpicModel: string,
  safetyModels: string[],
  hints: { bodyCabType?: string; fuelTypePrimary?: string } = {},
): SafetyRatingsModelResolution {
  const target = normalizeName(vpicModel)
  if (!target) return { resolvedModel: null, candidates: [] }

  const exact = safetyModels.find(model => normalizeName(model) === target)
  if (exact) return { resolvedModel: exact, candidates: [exact] }

  const candidates = safetyModels.filter(model =>
    normalizeName(model).startsWith(`${target} `),
  )
  if (candidates.length === 0) return { resolvedModel: null, candidates: [] }

  const expectedCabSuffix = cabSuffixForVehicle(hints.bodyCabType ?? '')
  const ranked = candidates
    .map((model, index) => ({
      model,
      index,
      score: scoreCandidate(
        model,
        expectedCabSuffix,
        hints.fuelTypePrimary ?? '',
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.model.length - b.model.length ||
        a.index - b.index,
    )

  return { resolvedModel: ranked[0].model, candidates }
}

/**
 * Inventory filters for a decoded vehicle. `search` matches part names by
 * make/model; `category` is a best-effort hint from the powertrain fields.
 */
export function toPartListFilters(vehicle: VehicleByVin): PartListFilters {
  const search = [vehicle.make.trim(), vehicle.model.trim()]
    .filter(part => part !== '')
    .join(' ')
  const fuel = normalizeName(vehicle.fuelTypePrimary)
  const drive = normalizeName(vehicle.driveType)

  let category: PartCategory | undefined
  if (fuel.includes('ELECTRIC')) {
    category = 'Electrical'
  } else if (fuel.includes('DIESEL')) {
    category = 'Engine'
  } else if (/4WD|4X4|AWD|ALL-WHEEL|ALL WHEEL/.test(drive)) {
    category = 'Transmission'
  }

  const filters: PartListFilters = {}
  if (search) filters.search = search
  if (category) filters.category = category
  return filters
}

/** Human-readable vehicle label, e.g. `2021 FORD F-150`. */
export function toVehicleLabel(vehicle: VehicleByVin): string {
  return [vehicle.modelYear, vehicle.make, vehicle.model]
    .map(part => part.trim())
    .filter(part => part !== '')
    .join(' ')
}
