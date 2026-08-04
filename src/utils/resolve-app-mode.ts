import type { AppMode } from '../types/app-mode'

function normalizeHost(hostname: string): string {
  return hostname.toLowerCase()
}

/**
 * Dual-mode preview hosts (Owner/Customer switcher):
 * - `dev.localhost` / `dev.*`
 * - `*.github.io` (GitHub Pages demos)
 */
export function isDevPreviewHost(
  hostname: string = typeof window !== 'undefined' ? window.location.hostname : 'localhost',
): boolean {
  const host = normalizeHost(hostname)
  return (
    host === 'dev' ||
    host.startsWith('dev.') ||
    host === 'github.io' ||
    host.endsWith('.github.io')
  )
}

/**
 * Resolve which site face to show from the hostname.
 * - internal.*  → owner / back-office
 * - everything else (apex autoshop, localhost, www, …) → customer portal
 * - on dev.*, defaults to owner (switcher can override in the UI)
 *
 * Optional query override: ?view=owner | ?view=customer
 */
export function resolveAppMode(
  hostname: string = typeof window !== 'undefined' ? window.location.hostname : 'localhost',
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): AppMode {
  const params = new URLSearchParams(search)
  const viewOverride = params.get('view')
  if (viewOverride === 'owner' || viewOverride === 'customer') {
    return viewOverride
  }

  const host = normalizeHost(hostname)
  if (host === 'internal' || host.startsWith('internal.')) {
    return 'owner'
  }
  if (isDevPreviewHost(host)) {
    return 'owner'
  }

  return 'customer'
}
