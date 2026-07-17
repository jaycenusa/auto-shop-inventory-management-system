import { useState } from 'react'
import Button from '../shared/button'
import { useAuth } from './auth-context'
import LoginModal from '../modal/login-modal'

export default function HeaderAuth() {
  const { user, logout } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const handleLogout = () => {
    void logout()
  }

  if (user) {
    const label = user.email ?? user.username
    const providerLabel =
      user.provider === 'aws'
        ? 'AWS'
        : user.provider === 'google'
          ? 'Google'
          : null

    return (
      <div className="header-auth">
        <span className="header-auth__user">
          {label}
          {providerLabel && (
            <span className="header-auth__provider">({providerLabel})</span>
          )}
        </span>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button variant="accent" size="sm" onClick={() => setLoginOpen(true)}>
        Log in
      </Button>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
