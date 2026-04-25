import { afterEach, describe, expect, it, vi } from 'vitest'

import { ZenMoneyApiError, ZenMoneyAuthError, ZenMoneyClient } from '../src/index.js'

interface FetchCall {
  input: URL | RequestInfo
  init: RequestInit | undefined
}

function createFetchMock(responseFactory: (call: FetchCall) => Response) {
  const calls: FetchCall[] = []
  const mock = vi.fn((input: URL | RequestInfo, init?: RequestInit) => {
    const call = { input, init }
    calls.push(call)
    return Promise.resolve(responseFactory(call))
  })

  return { mock, calls }
}

function installFetchMock(responseFactory: (call: FetchCall) => Response) {
  const { mock, calls } = createFetchMock(responseFactory)
  vi.stubGlobal('fetch', mock)
  return { mock, calls }
}

function toUrlString(value: URL | RequestInfo): string {
  if (value instanceof URL) {
    return value.toString()
  }

  if (typeof value === 'string') {
    return value
  }

  return value.url
}

function toBodyString(value: BodyInit | null | undefined): string {
  if (typeof value === 'string') {
    return value
  }

  if (value instanceof URLSearchParams) {
    return value.toString()
  }

  return ''
}

describe('ZenMoneyClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds an authorization url', () => {
    const client = new ZenMoneyClient({
      clientId: 'client-id',
      redirectUri: 'https://example.com/callback',
    })

    const url = new URL(
      client.createAuthorizationUrl({
        state: 'abc123',
      }),
    )

    expect(url.origin).toBe('https://api.zenmoney.ru')
    expect(url.pathname).toBe('/oauth2/authorize/')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('client_id')).toBe('client-id')
    expect(url.searchParams.get('redirect_uri')).toBe('https://example.com/callback')
    expect(url.searchParams.get('state')).toBe('abc123')
  })

  it('exchanges an oauth code for tokens', async () => {
    const { calls } = installFetchMock(
      () =>
        new Response(
          JSON.stringify({
            access_token: 'access-token',
            token_type: 'bearer',
            refresh_token: 'refresh-token',
            expires_in: 3600,
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
    )

    const client = new ZenMoneyClient({
      clientId: 'client-id',
      clientSecret: 'client-secret',
      redirectUri: 'https://example.com/callback',
    })

    const tokenSet = await client.authorizeWithCode({ code: 'oauth-code' })

    expect(tokenSet.accessToken).toBe('access-token')
    expect(tokenSet.refreshToken).toBe('refresh-token')
    expect(client.getAccessToken()).toBe('access-token')
    expect(client.getRefreshToken()).toBe('refresh-token')

    expect(calls).toHaveLength(1)
    const firstCall = calls.at(0)

    expect(firstCall).toBeDefined()
    expect(toUrlString(firstCall?.input ?? '')).toBe('https://api.zenmoney.ru/oauth2/token/')
    expect(firstCall?.init?.method).toBe('POST')
    expect(toBodyString(firstCall?.init?.body)).toContain('grant_type=authorization_code')
    expect(toBodyString(firstCall?.init?.body)).toContain('code=oauth-code')
  })

  it('sends a diff request with bearer token', async () => {
    const { calls } = installFetchMock(
      () =>
        new Response(
          JSON.stringify({
            serverTimestamp: 1234567890,
            transaction: [],
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
    )

    const client = new ZenMoneyClient({ accessToken: 'secret-token' })

    const diff = await client.diff({ serverTimestamp: 0 })

    expect(diff.serverTimestamp).toBe(1234567890)
    expect(calls).toHaveLength(1)

    const headers = new Headers(calls[0]?.init?.headers)
    expect(headers.get('authorization')).toBe('Bearer secret-token')
    expect(headers.get('content-type')).toBe('application/json')

    const body = JSON.parse(toBodyString(calls[0]?.init?.body)) as {
      serverTimestamp: number
      currentClientTimestamp: number
    }

    expect(body.serverTimestamp).toBe(0)
    expect(body.currentClientTimestamp).toBeTypeOf('number')
  })

  it('supports suggest for arrays', async () => {
    installFetchMock(
      () =>
        new Response(JSON.stringify([{ payee: 'МакДональдс' }]), {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }),
    )

    const client = new ZenMoneyClient({ accessToken: 'secret-token' })

    const suggestion = await client.suggest([{ payee: 'McDonalds' }])

    expect(Array.isArray(suggestion)).toBe(true)
    expect(suggestion[0]?.payee).toBe('МакДональдс')
  })

  it('throws a friendly auth error when token is missing', async () => {
    const client = new ZenMoneyClient()

    await expect(client.diff({ serverTimestamp: 0 })).rejects.toBeInstanceOf(ZenMoneyAuthError)
  })

  it('throws a typed api error for non-2xx responses', async () => {
    installFetchMock(
      () =>
        new Response(JSON.stringify({ error: 'invalid_request' }), {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        }),
    )

    const client = new ZenMoneyClient({ accessToken: 'secret-token' })

    await expect(client.suggest({ payee: 'test' })).rejects.toBeInstanceOf(ZenMoneyApiError)
  })
})
