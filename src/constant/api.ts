const injectedBaseUrl = DEFAULT_API_BASE_URL.replace(/\/$/, '')

/**
 * Shared AutoShop API origin for all services.
 * Injected at build time from the `DEFAULT_API_BASE_URL` environment variable.
 */
export { injectedBaseUrl as DEFAULT_API_BASE_URL }
