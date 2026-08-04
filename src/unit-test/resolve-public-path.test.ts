import { describe, expect, it } from 'vitest'
import { resolvePublicPath } from '../../scripts/resolve-public-path.mjs'

describe('resolvePublicPath', () => {
  it('uses / for local non-production builds', () => {
    expect(resolvePublicPath({ isProd: false })).toBe('/')
  })

  it('uses the GitHub Pages project subpath for production', () => {
    expect(resolvePublicPath({ isProd: true })).toBe(
      '/auto-shop-inventory-management-system/',
    )
  })

  it('prefers PUBLIC_PATH from the environment and normalizes a trailing slash', () => {
    expect(
      resolvePublicPath({ isProd: true, envPublicPath: '/custom' }),
    ).toBe('/custom/')
    expect(
      resolvePublicPath({ isProd: false, envPublicPath: '/custom/' }),
    ).toBe('/custom/')
  })
})
