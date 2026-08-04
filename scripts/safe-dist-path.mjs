import { isAbsolute, normalize, relative, resolve, sep } from 'node:path'

/**
 * Resolve a request URL path to a file under `distDir`, or `null` if unsafe.
 * Rejects absolute paths, `..` traversal, and escapes outside `distDir`.
 *
 * @param {string} distDir
 * @param {string} requestUrl raw `req.url` (may include query string)
 * @returns {string | null}
 */
export function resolveSafeDistPath(distDir, requestUrl) {
  const rawPath = (requestUrl ?? '/').split('?')[0] ?? '/'
  let decoded
  try {
    decoded = decodeURIComponent(rawPath)
  } catch {
    return null
  }

  // Drop leading slashes so join/resolve stays relative to distDir
  const relativePath =
    decoded === '/' || decoded === ''
      ? 'index.html'
      : decoded.replace(/^\/+/, '')

  if (
    relativePath.length === 0 ||
    isAbsolute(relativePath) ||
    relativePath.includes('\0') ||
    normalize(relativePath).split(sep).includes('..')
  ) {
    return null
  }

  const resolvedDist = resolve(distDir)
  const candidate = resolve(resolvedDist, relativePath)
  const rel = relative(resolvedDist, candidate)

  if (rel.startsWith('..') || isAbsolute(rel)) {
    return null
  }

  return candidate
}
