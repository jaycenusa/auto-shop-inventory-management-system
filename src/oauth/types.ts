export type AuthProvider = 'local' | 'google' | 'aws'

export type AuthUser = {
  username: string
  email?: string
  provider: AuthProvider
}

export type LoginCredentials = {
  username: string
  password: string
}
