import { describe, expect, it } from 'vitest'
import {
  extractWmi,
  hasDecodeError,
  isDecodableVin,
  isValidVin,
  normalizeVin,
  sanitizeVin,
} from '../utils/vin'

describe('normalizeVin', () => {
  it('uppercases and strips spaces and hyphens', () => {
    expect(normalizeVin('  1ftfw1e50-mfa 00001 ')).toBe('1FTFW1E50MFA00001')
  })

  it('returns an empty string for blank input', () => {
    expect(normalizeVin('   ')).toBe('')
  })
})

describe('sanitizeVin', () => {
  it('uppercases and drops every character a VIN cannot contain', () => {
    expect(sanitizeVin('1ftfw1e50-mfa 00001')).toBe('1FTFW1E50MFA00001')
    expect(sanitizeVin('1FT*FW1E50/MFA00001')).toBe('1FTFW1E50MFA00001')
  })

  it('drops the illegal letters I, O and Q', () => {
    expect(sanitizeVin('IOQ1FT')).toBe('1FT')
  })

  it('returns an empty string when nothing is usable', () => {
    expect(sanitizeVin(' -- ')).toBe('')
  })
})

describe('isValidVin', () => {
  it('accepts a normalized 17-character VIN', () => {
    expect(isValidVin('1FTFW1E50MFA00001')).toBe(true)
    expect(isValidVin('1ftfw1e50mfa00001')).toBe(true)
  })

  it('rejects the wrong length', () => {
    expect(isValidVin('1FTFW1E50MFA0000')).toBe(false)
    expect(isValidVin('1FTFW1E50MFA000012')).toBe(false)
  })

  it('rejects I, O and Q', () => {
    expect(isValidVin('IFTFW1E50MFA00001')).toBe(false)
    expect(isValidVin('OFTFW1E50MFA00001')).toBe(false)
    expect(isValidVin('QFTFW1E50MFA00001')).toBe(false)
  })

  it('rejects other non-VIN characters', () => {
    expect(isValidVin('1FTFW1E50MFA0000*')).toBe(false)
    expect(isValidVin('1FTFW1E50MFA0000_')).toBe(false)
  })
})

describe('isDecodableVin', () => {
  it('accepts partial VINs, including the * placeholder', () => {
    expect(isDecodableVin('1FTFW1E5')).toBe(true)
    expect(isDecodableVin('5UXWX7C5*BA')).toBe(true)
  })

  it('rejects empty input and anything longer than 17 characters', () => {
    expect(isDecodableVin('')).toBe(false)
    expect(isDecodableVin('1FTFW1E50MFA000012')).toBe(false)
  })

  it('rejects illegal characters', () => {
    expect(isDecodableVin('1FTFW1Q5')).toBe(false)
  })
})

describe('extractWmi', () => {
  it('returns the first three characters', () => {
    expect(extractWmi('1FTFW1E50MFA00001')).toBe('1FT')
    expect(extractWmi(' 5ux wx7c5 ')).toBe('5UX')
  })

  it('returns an empty string when shorter than three characters', () => {
    expect(extractWmi('1F')).toBe('')
  })
})

describe('hasDecodeError', () => {
  it('treats error code 0 and blank as clean', () => {
    expect(hasDecodeError({ errorCode: '0' })).toBe(false)
    expect(hasDecodeError({ errorCode: '' })).toBe(false)
  })

  it('flags any non-zero code in a comma-separated list', () => {
    expect(hasDecodeError({ errorCode: '1' })).toBe(true)
    expect(hasDecodeError({ errorCode: '0, 6' })).toBe(true)
  })
})
