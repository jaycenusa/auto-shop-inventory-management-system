/**
 * Resolve the asset public path for builds.
 * Local serve stays at `/`; GitHub Pages production uses the project subpath.
 *
 * @param {{ isProd: boolean, envPublicPath?: string }} options
 * @returns {string} public path ending with `/`
 */
export function resolvePublicPath({ isProd, envPublicPath }) {
  const fromEnv = envPublicPath?.trim()
  if (fromEnv) {
    return fromEnv.endsWith('/') ? fromEnv : `${fromEnv}/`
  }
  return isProd ? '/auto-shop-inventory-management-system/' : '/'
}
