import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../oauth/auth-context'
import { isAwsAuthConfigured, signInWithAwsHostedUi } from '../oauth/aws-auth'
import { getGoogleClientId, renderGoogleSignInButton } from '../oauth/google-auth'
import Button from '../shared/button'

type LoginModalProps = {
  open: boolean
  onClose: () => void
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const { login, loginWithGoogle, awsAuthReady } = useAuth()
  const titleId = useId()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const googleConfigured = Boolean(getGoogleClientId())
  const awsConfigured = isAwsAuthConfigured()

  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setError(null)
      setSubmitting(false)
      return
    }

    const container = googleButtonRef.current
    if (!container || !googleConfigured) return

    void renderGoogleSignInButton(
      container,
      (user) => {
        loginWithGoogle(user)
        setUsername('')
        setPassword('')
        setError(null)
        onClose()
      },
      (message) => setError(message),
    )
  }, [open, googleConfigured, loginWithGoogle, onClose])

  if (!open) return null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login({ username, password })
      setUsername('')
      setPassword('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAwsSignIn = async () => {
    setError(null)
    setSubmitting(true)

    try {
      await signInWithAwsHostedUi()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AWS sign-in failed.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="login-modal__backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div className="login-modal__overlay" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="login-modal__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-modal__header">
          <div>
            <h2 id={titleId} className="login-modal__title">
              Log in
            </h2>
            <p className="login-modal__subtitle">
              {awsAuthReady
                ? 'Sign in with AWS Cognito or another provider.'
                : 'Sign in to AutoShop IMS with your account.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="login-modal__close"
            aria-label="Close login dialog"
          >
            <svg className="login-modal__close-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 01-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form className="login-modal__form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Username</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder={awsAuthReady ? 'Cognito username' : 'your.username'}
              disabled={submitting}
            />
          </label>

          <label className="form-field">
            <span className="form-label">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              disabled={submitting}
            />
          </label>

          {error && (
            <p className="login-modal__error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="accent" fullWidth disabled={submitting}>
            {submitting ? 'Signing in…' : 'Log in'}
          </Button>
        </form>

        <div className="login-modal__divider">
          <div className="login-modal__divider-line" aria-hidden="true">
            <div className="login-modal__divider-border" />
          </div>
          <div className="login-modal__divider-text-wrap">
            <span className="login-modal__divider-text">Or continue with</span>
          </div>
        </div>

        <div className="login-modal__providers">
          {awsConfigured ? (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              className="login-modal__provider-btn"
              disabled={submitting}
              onClick={() => void handleAwsSignIn()}
            >
              <AwsIcon />
              Continue with AWS
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              disabled
              className="login-modal__provider-btn"
              title="Set AWS Cognito variables in .env to enable AWS sign-in"
            >
              <AwsIcon />
              Continue with AWS
            </Button>
          )}

          {googleConfigured ? (
            <div ref={googleButtonRef} className="login-modal__google-host" />
          ) : (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              disabled
              className="login-modal__provider-btn"
              title="Set GOOGLE_CLIENT_ID in .env to enable Google sign-in"
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          )}
        </div>

        {!awsConfigured && !googleConfigured && (
          <p className="login-modal__hint">
            Configure <code>.env</code> with AWS Cognito or{' '}
            <code>GOOGLE_CLIENT_ID</code> for social sign-in.
          </p>
        )}
        {awsConfigured && (
          <p className="login-modal__hint">
            AWS uses Amazon Cognito Hosted UI. Add{' '}
            <code>{window.location.origin}/</code> as an allowed
            callback URL in your user pool app client.
          </p>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="login-modal__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AwsIcon() {
  return (
    <svg className="login-modal__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#FF9900"
        d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.368 6.18 6.18 0 0 1-.248-.39c-.622.734-1.405 1.101-2.349 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.226.726-1.644.487-.419 1.133-.628 1.955-.628.272 0 .551.024.83.064.279.04.563.104.85.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.296.072-.583.167-.862.288a2.287 2.287 0 0 1-.28.104.49.49 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.2.024-.35.08-.44a.88.88 0 0 1 .335-.312c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.58zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.28-.512.056-.191.088-.423.088-.695v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.28.846.191.2.47.296.83.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.32l-1.678-5.543c-.048-.16-.072-.263-.072-.32 0-.127.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.32l1.237 4.839 1.148-4.83c.04-.16.088-.272.151-.32.064-.048.168-.08.319-.08h.639c.151 0 .255.025.31.08.064.048.112.16.16.32l1.162 4.897 1.265-4.896c.048-.16.104-.272.16-.32.065-.048.177-.08.32-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.127-.008.048-.025.12-.048.2l-1.722 5.545c-.048.16-.104.263-.168.32-.064.048-.168.08-.303.08h-.687c-.152 0-.256-.024-.32-.08-.063-.056-.119-.16-.167-.32l-1.147-4.764-1.14 4.763c-.04.16-.088.264-.15.32-.065.056-.177.08-.32.08h-.687zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.56.56 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .375-.758.828.828 0 0 0-.215-.559c-.144-.151-.415-.287-.807-.415-.752-.24-1.3-.51-1.637-.807-.335-.296-.502-.71-.502-1.23 0-.36.095-.68.28-.95.191-.279.448-.503.767-.67.32-.168.686-.296 1.094-.368.415-.08.83-.12 1.245-.12.215 0 .43.016.63.048.2.032.391.08.575.127.183.048.35.104.502.167.16.064.279.128.359.191.096.072.16.152.2.24.04.087.064.191.064.31v.375c0 .167-.064.255-.183.255-.064 0-.168-.024-.31-.072a4.911 4.911 0 0 0-1.373-.2c-.455 0-.807.072-1.053.215-.248.144-.367.359-.367.646 0 .215.08.399.24.551.16.152.455.304.886.447.727.232 1.261.495 1.605.79.344.295.512.71.512 1.245 0 .367-.08.702-.24 1.005-.16.303-.383.567-.67.79-.287.224-.63.4-1.037.518-.415.127-.862.191-1.349.191z"
      />
      <path
        fill="#252F3E"
        d="M21.35 20.078c-2.802 2.07-6.857 3.174-10.35 3.174-4.89 0-9.294-1.81-12.63-4.82-.263-.24-.024-.566.287-.378 3.592 2.086 8.016 3.35 12.598 3.35 3.09 0 6.492-.64 9.63-1.963.47-.2.87.31.465.637zM22.54 18.6c-.359-.455-2.374-1.086-3.286-1.226-.28-.04-.484.127-.335.39 1.003 1.742 2.79 2.502 4.375 2.87.36.08.68-.167.535-.502-.415-.99-1.15-1.83-2.29-2.532z"
      />
    </svg>
  )
}
