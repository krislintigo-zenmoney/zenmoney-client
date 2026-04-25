import { ZenMoneyApiError, ZenMoneyAuthError } from './errors.js'
import type {
  CreateAuthorizationUrlParams,
  DiffRequest,
  DiffResponse,
  ExchangeCodeParams,
  OAuthTokenSet,
  RefreshTokenParams,
  SuggestRequest,
  SuggestResponse,
  ZenMoneyClientOptions,
} from './types.js'
import { buildUrl, parseOAuthTokenResponse, resolveClientOptions } from './utils.js'

interface RequestOptions {
  auth?: boolean
  headers?: HeadersInit
  body?: BodyInit
}

export class ZenMoneyClient {
  private readonly apiBaseUrl: string
  private readonly authBaseUrl: string
  private clientId: string | undefined
  private clientSecret: string | undefined
  private redirectUri: string | undefined
  private accessToken: string | undefined
  private refreshToken: string | undefined
  private userAgent: string | undefined

  public constructor(options: ZenMoneyClientOptions = {}) {
    const resolved = resolveClientOptions(options)

    this.apiBaseUrl = resolved.apiBaseUrl
    this.authBaseUrl = resolved.authBaseUrl
    this.clientId = resolved.clientId
    this.clientSecret = resolved.clientSecret
    this.redirectUri = resolved.redirectUri
    this.accessToken = resolved.accessToken
    this.refreshToken = resolved.refreshToken
    this.userAgent = resolved.userAgent
  }

  public createAuthorizationUrl(params: CreateAuthorizationUrlParams = {}): string {
    const clientId = params.clientId ?? this.clientId
    const redirectUri = params.redirectUri ?? this.redirectUri

    if (!clientId || !redirectUri) {
      throw new ZenMoneyAuthError(
        'clientId and redirectUri are required to create an authorization URL.',
      )
    }

    const url = buildUrl(this.authBaseUrl, 'authorize/')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)

    if (params.state) {
      url.searchParams.set('state', params.state)
    }

    if (params.scope) {
      url.searchParams.set('scope', params.scope)
    }

    return url.toString()
  }

  public async authorizeWithCode(params: ExchangeCodeParams): Promise<OAuthTokenSet> {
    const clientId = params.clientId ?? this.clientId
    const clientSecret = params.clientSecret ?? this.clientSecret
    const redirectUri = params.redirectUri ?? this.redirectUri

    if (!clientId || !clientSecret || !redirectUri) {
      throw new ZenMoneyAuthError(
        'clientId, clientSecret and redirectUri are required to exchange a code for a token.',
      )
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: params.code,
      redirect_uri: redirectUri,
    })

    const payload = await this.requestJson(buildUrl(this.authBaseUrl, 'token/'), {
      body,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })

    const tokenSet = parseOAuthTokenResponse(payload)
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUri = redirectUri
    this.setTokens(tokenSet)

    return tokenSet
  }

  public async refreshAccessToken(params: RefreshTokenParams = {}): Promise<OAuthTokenSet> {
    const clientId = params.clientId ?? this.clientId
    const clientSecret = params.clientSecret ?? this.clientSecret
    const refreshToken = params.refreshToken ?? this.refreshToken

    if (!clientId || !clientSecret || !refreshToken) {
      throw new ZenMoneyAuthError(
        'clientId, clientSecret and refreshToken are required to refresh the access token.',
      )
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    })

    const payload = await this.requestJson(buildUrl(this.authBaseUrl, 'token/'), {
      body,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })

    const tokenSet = parseOAuthTokenResponse(payload, refreshToken)
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.setTokens(tokenSet)

    return tokenSet
  }

  public async diff(payload: DiffRequest): Promise<DiffResponse> {
    return this.requestJson<DiffResponse>(buildUrl(this.apiBaseUrl, 'diff/'), {
      auth: true,
      body: JSON.stringify({
        currentClientTimestamp: payload.currentClientTimestamp ?? Math.floor(Date.now() / 1000),
        ...payload,
      }),
      headers: {
        'content-type': 'application/json',
      },
    })
  }

  public async suggest(payload: SuggestRequest): Promise<SuggestResponse>
  public async suggest(payload: SuggestRequest[]): Promise<SuggestResponse[]>
  public async suggest(
    payload: SuggestRequest | SuggestRequest[],
  ): Promise<SuggestResponse | SuggestResponse[]> {
    return this.requestJson<SuggestResponse | SuggestResponse[]>(
      buildUrl(this.apiBaseUrl, 'suggest/'),
      {
        auth: true,
        body: JSON.stringify(payload),
        headers: {
          'content-type': 'application/json',
        },
      },
    )
  }

  public setAccessToken(accessToken: string): void {
    this.accessToken = accessToken
  }

  public setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken
  }

  public setTokens(tokenSet: Pick<OAuthTokenSet, 'accessToken' | 'refreshToken'>): void {
    this.accessToken = tokenSet.accessToken

    if (tokenSet.refreshToken) {
      this.refreshToken = tokenSet.refreshToken
    }
  }

  public clearTokens(): void {
    this.accessToken = undefined
    this.refreshToken = undefined
  }

  public getAccessToken(): string | undefined {
    return this.accessToken
  }

  public getRefreshToken(): string | undefined {
    return this.refreshToken
  }

  private async requestJson<T = unknown>(input: URL, options: RequestOptions): Promise<T> {
    const headers = new Headers(options.headers)
    headers.set('accept', 'application/json')

    if (this.userAgent) {
      headers.set('user-agent', this.userAgent)
    }

    if (options.auth) {
      if (!this.accessToken) {
        throw new ZenMoneyAuthError(
          'Access token is missing. Call authorizeWithCode(), refreshAccessToken() or setAccessToken() first.',
        )
      }

      headers.set('authorization', `Bearer ${this.accessToken}`)
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
