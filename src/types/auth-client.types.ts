export interface OAuthTokenSet {
  accessToken: string
  tokenType: string
  expiresIn?: number
  refreshToken?: string
  scope?: string
  raw: Record<string, unknown>
}

export interface ExchangeCodeParams {
  code: string
  clientId?: string
  clientSecret?: string
  redirectUri?: string
}

export interface RefreshTokenParams {
  refreshToken?: string
  clientId?: string
  clientSecret?: string
}

export interface CreateAuthorizationUrlParams {
  clientId?: string
  redirectUri?: string
  state?: string
  scope?: string
}

export interface ZenMoneyAuthClientOptions {
  refreshToken?: string
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  authBaseUrl?: string
  userAgent?: string
}
