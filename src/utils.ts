import { ZenMoneyAuthError } from './errors'
import type { OAuthTokenSet, ZenMoneyClientOptions } from './types.js'

const DEFAULT_API_BASE_URL = 'https://api.zenmoney.ru/v8/'
const DEFAULT_AUTH_BASE_URL = 'https://api.zenmoney.ru/oauth2/'

export function resolveClientOptions(options: ZenMoneyClientOptions) {
  return {
    apiBaseUrl: ensureTrailingSlash(options.apiBaseUrl ?? DEFAULT_API_BASE_URL),
    authBaseUrl: ensureTrailingSlash(options.authBaseUrl ?? DEFAULT_AUTH_BASE_URL),
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    redirectUri: options.redirectUri,
    accessToken: options.accessToken,
    refreshToken: options.refreshToken,
    userAgent: options.userAgent,
  }
}

export function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`
}

export function buildUrl(baseUrl: string, path: string): URL {
  return new URL(path, ensureTrailingSlash(baseUrl))
}

export function parseOAuthTokenResponse(
  payload: unknown,
  fallbackRefreshToken?: string,
): OAuthTokenSet {
  if (!isRecord(payload)) {
    throw new ZenMoneyAuthError('OAuth token response is not a JSON object.')
  }

  const accessToken = payload.access_token
  const tokenType = payload.token_type
  const expiresIn = payload.expires_in
  const refreshToken = payload.refresh_token
  const scope = payload.scope

  if (typeof accessToken !== 'string' || typeof tokenType !== 'string') {
    throw new ZenMoneyAuthError(
      'OAuth token response does not contain access_token and token_type.',
    )
  }

  let refreshTokenField: Partial<Pick<OAuthTokenSet, 'refreshToken'>> = {}

  if (typeof refreshToken === 'string') {
    refreshTokenField = { refreshToken }
  } else if (typeof fallbackRefreshToken === 'string') {
    refreshTokenField = { refreshToken: fallbackRefreshToken }
  }

  return {
    accessToken,
    tokenType,
    raw: payload,
    ...(typeof expiresIn === 'number' ? { expiresIn } : {}),
    ...refreshTokenField,
    ...(typeof scope === 'string' ? { scope } : {}),
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
