import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveSafeDistPath } from '../../scripts/safe-dist-path.mjs'

const distDir = path.resolve('/tmp/auto-shop-dist')

describe('resolveSafeDistPath', () => {
  it('maps / to index.html under dist', () => {
    expect(resolveSafeDistPath(distDir, '/')).toBe(
      path.join(distDir, 'index.html'),
    )
  })

  it('resolves a normal asset path', () => {
    expect(resolveSafeDistPath(distDir, '/main.js')).toBe(
      path.join(distDir, 'main.js'),
    )
  })

  it('strips query strings', () => {
    expect(resolveSafeDistPath(distDir, '/main.css?v=1')).toBe(
      path.join(distDir, 'main.css'),
    )
  })

  it('rejects path traversal with ..', () => {
    expect(resolveSafeDistPath(distDir, '/../secret.txt')).toBeNull()
    expect(resolveSafeDistPath(distDir, '/assets/../../etc/passwd')).toBeNull()
  })

  it('rejects encoded traversal', () => {
    expect(resolveSafeDistPath(distDir, '/%2e%2e/%2e%2e/etc/passwd')).toBeNull()
  })

  it('rejects null bytes', () => {
    expect(resolveSafeDistPath(distDir, '/main.js%00.txt')).toBeNull()
  })
})
