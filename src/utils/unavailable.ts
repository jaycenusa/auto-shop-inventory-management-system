/** Shown in the UI when an API resource cannot be loaded. */
export const UNAVAILABLE = '-'

/** Return `value` as a string, or `-` when the resource is unavailable. */
export function displayOrDash(
  value: string | number | null | undefined,
  unavailable: boolean,
): string {
  if (unavailable) return UNAVAILABLE
  if (value === null || value === undefined || value === '') return UNAVAILABLE
  return String(value)
}
