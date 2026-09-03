/**
 * Resolve the AutoShop API origin for builds.
 * `npm run dev` always targets local backend; production/preview use .env or the hosted default.
 *
 * @param {{ isDev: boolean, envApiBaseUrl?: string }} options
 * @returns {string} origin without a trailing slash
 */
export function resolveApiBaseUrl({ isDev, envApiBaseUrl }) {
  if (isDev) {
    return 'http://localhost:8080'
  }

  const fromEnv = envApiBaseUrl?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  return 'https://autoshopapiservice.onrender.com'
}
