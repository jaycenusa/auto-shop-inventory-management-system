import { Amplify } from 'aws-amplify'
import {
  fetchUserAttributes,
  getCurrentUser,
  signIn,
  signInWithRedirect,
  signOut,
} from 'aws-amplify/auth'
import type { AuthUser } from './types'

export type AwsAuthConfig = {
  region: string
  userPoolId: string
  userPoolClientId: string
  cognitoDomain: string
  redirectSignIn: string
  redirectSignOut: string
}

let amplifyConfigured = false

function readEnv(name: string): string {
  return typeof name === 'string' ? name.trim() : ''
}

export function getaws-authConfig(): aws-authConfig | null {
  const region = readEnv(AWS_REGION)
  const userPoolId = readEnv(AWS_USER_POOL_ID)
  const userPoolClientId = readEnv(AWS_USER_POOL_CLIENT_ID)
  const cognitoDomain = readEnv(AWS_COGNITO_DOMAIN)
  const redirectSignIn = readEnv(AWS_REDIRECT_SIGN_IN) || 'http://localhost:3000/'
  const redirectSignOut = readEnv(AWS_REDIRECT_SIGN_OUT) || redirectSignIn

  if (!region || !userPoolId || !userPoolClientId || !cognitoDomain) {
    return null
  }

  return {
    region,
    userPoolId,
    userPoolClientId,
    cognitoDomain,
    redirectSignIn,
    redirectSignOut,
  }
}

export function isaws-authConfigured(): boolean {
  return getaws-authConfig() !== null
}

export function configureaws-auth(): boolean {
  const config = getaws-authConfig()
  if (!config || amplifyConfigured) {
    return Boolean(config)
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
        loginWith: {
          oauth: {
            domain: config.cognitoDomain,
            scopes: ['email', 'openid', 'profile'],
            redirectSignIn: [config.redirectSignIn],
            redirectSignOut: [config.redirectSignOut],
            responseType: 'code',
          },
          username: true,
          email: true,
        },
      },
    },
  })

  amplifyConfigured = true
  return true
}

async function mapAmplifyUserToAuthUser(): Promise<AuthUser> {
  const cognitoUser = await getCurrentUser()
  let email: string | undefined
  let preferredUsername: string | undefined

  try {
    const attributes = await fetchUserAttributes()
    email = attributes.email
    preferredUsername = attributes.preferred_username ?? attributes.name
  } catch {
    // Attributes may be unavailable for some sessions.
  }

  const username =
    preferredUsername ??
    email?.split('@')[0] ??
    cognitoUser.username ??
    'AWS user'

  return {
    username,
    email,
    provider: 'aws',
  }
}

export async function getAwsSignedInUser(): Promise<AuthUser | null> {
  if (!configureaws-auth()) return null

  try {
    await getCurrentUser()
    return await mapAmplifyUserToAuthUser()
  } catch {
    return null
  }
}

export async function signInWithAwsHostedUi(): Promise<void> {
  if (!configureaws-auth()) {
    throw new Error(
      'AWS Cognito is not configured. Set AWS_REGION, AWS_USER_POOL_ID, AWS_USER_POOL_CLIENT_ID, and AWS_COGNITO_DOMAIN in your .env file.',
    )
  }

  await signInWithRedirect()
}

export async function signInWithAwsCredentials(
  username: string,
  password: string,
): Promise<AuthUser> {
  if (!configureaws-auth()) {
    throw new Error('AWS Cognito is not configured.')
  }

  const trimmedUsername = username.trim()
  const trimmedPassword = password.trim()
  if (!trimmedUsername || !trimmedPassword) {
    throw new Error('Enter both username and password.')
  }

  const result = await signIn({
    username: trimmedUsername,
    password: trimmedPassword,
  })

  if (!result.isSignedIn) {
    throw new Error('AWS sign-in requires additional steps. Try “Continue with AWS” instead.')
  }

  return mapAmplifyUserToAuthUser()
}

export async function signOutAws(): Promise<void> {
  if (!configureAwsAuth()) return

  try {
    await signOut()
  } catch {
    // Ignore sign-out errors when Cognito is not active.
  }
}
