declare const GOOGLE_CLIENT_ID: string

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
