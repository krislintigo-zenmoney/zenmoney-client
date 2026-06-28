import { ZenMoneyApiError, ZenMoneyAuthError } from './errors.js'

import type { OAuthTokenSet } from './types/auth-client.types.js'

export const ensureTrailingSlash = (value: string): string =>
  value.endsWith('/') ? value : `${value}/`

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const buildUrl = (baseUrl: string, path: string): URL =>
  new URL(path, ensureTrailingSlash(baseUrl))

export const parseOAuthTokenResponse = (
  payload: unknown,
  fallbackRefreshToken?: string,
): OAuthTokenSet => {
  if (!isRecord(payload)) {
    throw new ZenMoneyAuthError('OAuth token response is not a JSON object.')
  }

  const { access_token, token_type } = payload

  if (typeof access_token !== 'string' || typeof token_type !== 'string') {
    throw new ZenMoneyAuthError(
      'OAuth token response does not contain access_token and token_type.',
    )
  }

  const { expires_in, refresh_token, scope } = payload

  let refreshTokenField: Partial<Pick<OAuthTokenSet, 'refreshToken'>> = {}

  if (typeof refresh_token === 'string') {
    refreshTokenField = { refreshToken: refresh_token }
  } else if (typeof fallbackRefreshToken === 'string') {
    refreshTokenField = { refreshToken: fallbackRefreshToken }
  }

  return {
    accessToken: access_token,
    tokenType: token_type,
    raw: payload,
    ...(typeof expires_in === 'number' && { expiresIn: expires_in }),
    ...refreshTokenField,
    ...(typeof scope === 'string' && { scope }),
  }
}

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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
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
