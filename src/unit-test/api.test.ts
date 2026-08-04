import { describe, expect, it } from 'vitest'
import { DEFAULT_API_BASE_URL } from '../constant/api'

describe('DEFAULT_API_BASE_URL', () => {
  it('exposes the injected API origin without a trailing slash', () => {
    expect(DEFAULT_API_BASE_URL).toBe(
      'https://autoshopapiservice.onrender.com',
    )
    expect(DEFAULT_API_BASE_URL.endsWith('/')).toBe(false)
  })
})
