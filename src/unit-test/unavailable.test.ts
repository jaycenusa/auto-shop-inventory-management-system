import { describe, expect, it } from 'vitest'
import { displayOrDash, UNAVAILABLE } from '../utils/unavailable'

describe('displayOrDash', () => {
  it('returns dash when the resource is unavailable', () => {
    expect(displayOrDash(42, true)).toBe(UNAVAILABLE)
    expect(displayOrDash('Acme', true)).toBe('-')
  })

  it('returns the stringified value when available', () => {
    expect(displayOrDash(12, false)).toBe('12')
    expect(displayOrDash('Bosch', false)).toBe('Bosch')
  })

  it('returns dash for empty available values', () => {
    expect(displayOrDash(null, false)).toBe(UNAVAILABLE)
    expect(displayOrDash(undefined, false)).toBe(UNAVAILABLE)
    expect(displayOrDash('', false)).toBe(UNAVAILABLE)
  })
})
