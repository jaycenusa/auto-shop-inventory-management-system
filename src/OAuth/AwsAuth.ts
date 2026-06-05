import type { AuthUser } from './Types'

export type AwsAuthConfig = {
  region: string
  userPoolId: string
  userPoolClientId: string
  cognitoDomain: string
  redirectSignIn: string
  redirectSignOut: string
}

export function getAwsAuthConfig(): AwsAuthConfig | null {
  return null
}

export function isAwsAuthConfigured(): boolean {
  return false
}

export function configureAwsAuth(): boolean {
  return false
}

export async function getAwsSignedInUser(): Promise<AuthUser | null> {
  return null
}

export async function signInWithAwsHostedUi(): Promise<void> {
  throw new Error('AWS Cognito sign-in is not available.')
}

export async function signInWithAwsCredentials(
  _username: string,
  _password: string,
): Promise<AuthUser> {
  throw new Error('AWS Cognito sign-in is not available.')
}

export async function signOutAws(): Promise<void> {}
