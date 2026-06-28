import { ZenMoneyAuthError } from './errors.js'
import { buildUrl, parseOAuthTokenResponse, requestJson } from './utils.js'

import type {
  CreateAuthorizationUrlParams,
  ExchangeCodeParams,
  OAuthTokenSet,
  RefreshTokenParams,
  ZenMoneyAuthClientOptions,
} from './types/auth-client.types.js'

export class ZenMoneyAuthClient {
  private readonly authBaseUrl = 'https://api.zenmoney.ru/oauth2/'
  private clientId: string | undefined
  private clientSecret: string | undefined
  private redirectUri: string | undefined
  private refreshToken: string | undefined
  private readonly userAgent: string | undefined

  constructor(options: ZenMoneyAuthClientOptions = {}) {
    this.clientId = options.clientId
    this.clientSecret = options.clientSecret
    this.redirectUri = options.redirectUri
    this.refreshToken = options.refreshToken
    this.userAgent = options.userAgent
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

    return url.href
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

    const payload = await requestJson(buildUrl(this.authBaseUrl, 'token/'), {
      body,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      userAgent: this.userAgent,
    })

    const tokenSet = parseOAuthTokenResponse(payload)
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUri = redirectUri

    if (tokenSet.refreshToken) {
      this.refreshToken = tokenSet.refreshToken
    }

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

    const payload = await requestJson(buildUrl(this.authBaseUrl, 'token/'), {
      body,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      userAgent: this.userAgent,
    })

    const tokenSet = parseOAuthTokenResponse(payload, refreshToken)
    this.clientId = clientId
    this.clientSecret = clientSecret

    if (tokenSet.refreshToken) {
      this.refreshToken = tokenSet.refreshToken
    }

    return tokenSet
  }

  public setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken
  }

  public getRefreshToken(): string | undefined {
    return this.refreshToken
  }

  public clearRefreshToken(): void {
    this.refreshToken = undefined
  }
}
