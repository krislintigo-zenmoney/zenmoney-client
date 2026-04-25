import { ZenMoneyApiError, ZenMoneyAuthError } from './errors.js'
import type { OAuthTokenSet } from './types/auth-client.types.js'

export const ensureTrailingSlash = (value: string): string =>
  value.endsWith('/') ? value : `${value}/`

export const buildUrl = (baseUrl: string, path: string): URL =>
  new URL(path, ensureTrailingSlash(baseUrl))

export const parseOAuthTokenResponse = (
  payload: unknown,
  fallbackRefreshToken?: string,
): OAuthTokenSet => {
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

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

interface RequestJsonOptions {
  accessToken?: string | undefined
  body?: BodyInit
  headers?: HeadersInit
  missingAuthMessage?: string
  requireAuth?: boolean
  userAgent?: string | undefined
}

export async function requestJson<T = unknown>(
  input: URL,
  options: RequestJsonOptions,
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('accept', 'application/json')

  if (options.userAgent) {
    headers.set('user-agent', options.userAgent)
  }

  if (options.requireAuth) {
    if (!options.accessToken) {
      throw new ZenMoneyAuthError(
        options.missingAuthMessage ?? 'Access token is required for this request.',
      )
    }

    headers.set('authorization', `Bearer ${options.accessToken}`)
  }

  const response = await fetch(input, {
    method: 'POST',
    headers,
    body: options.body ?? null,
  })

  const payload = await parseResponseBody(response)

  if (!response.ok) {
    throw new ZenMoneyApiError(`ZenMoney API request failed with status ${response.status}.`, {
      status: response.status,
      payload,
    })
  }

  return payload as T
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}
