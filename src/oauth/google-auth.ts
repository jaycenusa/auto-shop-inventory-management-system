import type { AuthUser } from './types'

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let scriptLoadPromise: Promise<void> | null = null

export function getGoogleClientId(): string {
  return typeof GOOGLE_CLIENT_ID === 'string' ? GOOGLE_CLIENT_ID : ''
}

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is only available in the browser.'))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google sign-in.')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google sign-in.'))
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export function parseGoogleCredential(credential: string): AuthUser {
  const payload = JSON.parse(atob(credential.split('.')[1] ?? '')) as {
    email?: string
    name?: string
  }

  const email = payload.email ?? ''
  const name = payload.name ?? email.split('@')[0] ?? 'Google user'

  return {
    username: name,
    email,
    provider: 'google',
  }
}

export type GoogleCredentialResponse = {
  credential?: string
}

export async function renderGoogleSignInButton(
  container: HTMLElement,
  onSuccess: (user: AuthUser) => void,
  onError: (message: string) => void,
): Promise<void> {
  const clientId = getGoogleClientId()
  if (!clientId) {
    onError('Google sign-in is not configured. Set GOOGLE_CLIENT_ID in your .env file.')
    return
  }

  try {
    await loadGoogleIdentityScript()
  } catch {
    onError('Could not load Google sign-in. Check your network connection.')
    return
  }

  const google = window.google
  if (!google?.accounts?.id) {
    onError('Google sign-in is unavailable.')
    return
  }

  container.replaceChildren()

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        onError('Google sign-in did not return a credential.')
        return
      }
      try {
        onSuccess(parseGoogleCredential(response.credential))
      } catch {
        onError('Could not read your Google account details.')
      }
    },
  })

  google.accounts.id.renderbutton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    width: container.offsetWidth || 320,
  })
}
