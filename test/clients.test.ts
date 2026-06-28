import { afterEach, describe, expect, it, vi } from 'vitest'

import { ZenMoneyApiClient, ZenMoneyAuthClient } from '../src/index.js'

interface FetchCall {
  input: URL | RequestInfo
  init: RequestInit | undefined
}

function createFetchMock(responseFactory: (call: FetchCall) => Response) {
  const calls: Array<FetchCall> = []
  const mock = vi.fn((input: URL | RequestInfo, init?: RequestInit) => {
    const call = { input, init }
    calls.push(call)

    return responseFactory(call)
  })

  return { calls, mock }
}

function toUrlString(value: URL | RequestInfo): string {
  if (value instanceof URL) {
    return value.href
  }

  if (typeof value === 'string') {
    return value
  }

  return value.url
}

describe('Split clients', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses ZenMoneyAuthClient for oauth operations', async () => {
    const { calls, mock } = createFetchMock(() =>
      Response.json(
        {
          access_token: 'access-token',
          token_type: 'bearer',
          refresh_token: 'refresh-token',
        },
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    )

    vi.stubGlobal('fetch', mock)

    const client = new ZenMoneyAuthClient({
      clientId: 'client-id',
      clientSecret: 'client-secret',
      redirectUri: 'https://example.com/callback',
    })

    const tokenSet = await client.authorizeWithCode({ code: 'oauth-code' })

    expect(tokenSet.accessToken).toBe('access-token')
    expect(client.getRefreshToken()).toBe('refresh-token')
    expect(toUrlString(calls[0]?.input ?? '')).toBe('https://api.zenmoney.ru/oauth2/token/')
  })

  it('uses ZenMoneyApiClient for diff and suggest operations', async () => {
    const { calls, mock } = createFetchMock(() =>
      Response.json(
        {
          serverTimestamp: 1_234_567_890,
          transaction: [],
        },
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    )

    vi.stubGlobal('fetch', mock)

    const client = new ZenMoneyApiClient()
    const diff = await client.diff({ accessToken: 'secret-token', serverTimestamp: 0 })

    expect(diff.serverTimestamp).toBe(1_234_567_890)
    expect(new Headers(calls[0]?.init?.headers).get('authorization')).toBe('Bearer secret-token')
  })
})
