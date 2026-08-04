declare const GOOGLE_CLIENT_ID: string
declare const AWS_REGION: string
declare const AWS_USER_POOL_ID: string
declare const AWS_USER_POOL_CLIENT_ID: string
declare const AWS_COGNITO_DOMAIN: string
declare const AWS_REDIRECT_SIGN_IN: string
declare const AWS_REDIRECT_SIGN_OUT: string
/** AutoShop API origin; set via DEFAULT_API_BASE_URL in `.env`. */
declare const DEFAULT_API_BASE_URL: string

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string
          callback: (response: { credential?: string }) => void
        }) => void
        renderButton: (
          parent: HTMLElement,
          options: Record<string, string | number>,
        ) => void
      }
    }
  }
}
