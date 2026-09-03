import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl } from '../../scripts/resolve-api-base-url.mjs'

describe('resolveApiBaseUrl', () => {
  it('uses localhost:8080 for npm run dev', () => {
    expect(resolveApiBaseUrl({ isDev: true })).toBe('http://localhost:8080')
  })

  it('ignores DEFAULT_API_BASE_URL from env while in dev', () => {
    expect(
      resolveApiBaseUrl({
        isDev: true,
        envApiBaseUrl: 'https://autoshopapiservice.onrender.com',
      }),
    ).toBe('http://localhost:8080')
  })

  it('uses DEFAULT_API_BASE_URL for production builds and strips a trailing slash', () => {
    expect(
      resolveApiBaseUrl({
        isDev: false,
        envApiBaseUrl: 'https://api.example.com/',
      }),
    ).toBe('https://api.example.com')
  })

  it('falls back to the hosted AutoShop API when env is unset for non-dev', () => {
    expect(resolveApiBaseUrl({ isDev: false })).toBe(
      'https://autoshopapiservice.onrender.com',
    )
  })
})
