/**
 * NHTSA public API host used for recalls and safety ratings. Note that VIN
 * decoding lives on a different host (see `VPIC_VEHICLES_BASE_URL`).
 *
 * Called straight from the browser: this host and vPIC both send permissive
 * CORS headers, so they need no dev-server proxy (which only handles `/api`).
 */
export const NHTSA_API_BASE_URL = 'https://api.nhtsa.gov'
