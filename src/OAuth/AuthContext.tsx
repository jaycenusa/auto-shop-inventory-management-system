import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  configureAwsAuth,
  getAwsSignedInUser,
  signInWithAwsCredentials,
  signOutAws,
} from './AwsAuth'
import type { AuthUser, LoginCredentials } from './Types'

const AUTH_STORAGE_KEY = 'autoshop_ims_auth'

type StoredAuthUser = Pick<AuthUser, 'username' | 'provider'>

type AuthContextValue = {
  user: AuthUser | null
  login: (credentials: LoginCredentials) => Promise<void>
  loginWithGoogle: (user: AuthUser) => void
  logout: () => Promise<void>
  awsAuthReady: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredAuthUser>
    if (!parsed.username || !parsed.provider) return null
    return {
      username: parsed.username,
      provider: parsed.provider,
    }
  } catch {
    return null
  }
}

function storeUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  const storedUser: StoredAuthUser = {
    username: user.username,
    provider: user.provider,
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedUser))
}

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const awsAuthReady = configureAwsAuth()

  useEffect(() => {
    if (!awsAuthReady) return

    let cancelled = false

    void (async () => {
      const awsUser = await getAwsSignedInUser()
      if (!cancelled && awsUser) {
        setUser(awsUser)
        storeUser(awsUser)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [awsAuthReady])

  const login = useCallback(async (credentials: LoginCredentials) => {
    if (awsAuthReady) {
      const nextUser = await signInWithAwsCredentials(
        credentials.username,
        credentials.password,
      )
      setUser(nextUser)
      storeUser(nextUser)
      return
    }

    const username = credentials.username.trim()
    const password = credentials.password.trim()
    if (!username || !password) return

    const nextUser: AuthUser = {
      username,
      provider: 'local',
    }
    setUser(nextUser)
    storeUser(nextUser)
  }, [awsAuthReady])

  const loginWithGoogle = useCallback((nextUser: AuthUser) => {
    setUser(nextUser)
    storeUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    if (user?.provider === 'aws') {
      await signOutAws()
    }
    setUser(null)
    storeUser(null)
  }, [user?.provider])

  const value = useMemo(
    () => ({
      user,
      login,
      loginWithGoogle,
      logout,
      awsAuthReady,
    }),
    [user, login, loginWithGoogle, logout, awsAuthReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }
  return context
}
