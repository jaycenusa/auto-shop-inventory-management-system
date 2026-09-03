/** Characters allowed in a VIN; I, O and Q are excluded by standard. */
const VIN_CHARACTERS = /^[A-HJ-NPR-Z0-9]+$/

/** Partial VINs may use `*` as a placeholder for unknown positions. */
const PARTIAL_VIN_CHARACTERS = /^[A-HJ-NPR-Z0-9*]+$/

export const VIN_LENGTH = 17

/** Number of leading characters forming the World Manufacturer Identifier. */
export const WMI_LENGTH = 3

/** Uppercase and strip separators so user input matches API expectations. */
export function normalizeVin(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, '')
}

/**
 * Uppercase and drop every character a VIN cannot contain. Suited to live
 * input handling, where users paste VINs with punctuation or stray letters.
 */
export function sanitizeVin(input: string): string {
  return input.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
}

/** True for a complete 17-character VIN using only legal characters. */
export function isValidVin(vin: string): boolean {
  const normalized = normalizeVin(vin)
  return normalized.length === VIN_LENGTH && VIN_CHARACTERS.test(normalized)
}

/**
 * True when vPIC can attempt a decode: a partial VIN is acceptable, so only
 * length and character set are enforced.
 */
export function isDecodableVin(vin: string): boolean {
  const normalized = normalizeVin(vin)
  return (
    normalized.length > 0 &&
    normalized.length <= VIN_LENGTH &&
    PARTIAL_VIN_CHARACTERS.test(normalized)
  )
}

/** Leading 3 characters of the VIN, or an empty string when too short. */
export function extractWmi(vin: string): string {
  const normalized = normalizeVin(vin)
  return normalized.length >= WMI_LENGTH
    ? normalized.slice(0, WMI_LENGTH)
    : ''
}

/**
 * vPIC answers with HTTP 200 even for problem VINs, reporting a non-zero
 * `ErrorCode` (which may be a comma-separated list) instead.
 */
export function hasDecodeError(vehicle: { errorCode: string }): boolean {
  const codes = vehicle.errorCode
    .split(',')
    .map(code => code.trim())
    .filter(code => code !== '')
  return codes.some(code => code !== '0')
}
