# zenmoney-client

Modern TypeScript/Node.js SDK for [ZenMoney API](https://github.com/zenmoney/ZenPlugins/wiki/ZenMoney-API).

Included out of the box:

- `ZenMoneyAuthClient` for the OAuth2 flow (authorization URL, code exchange, token refresh)
- `ZenMoneyApiClient` for `diff` and `suggest` calls
- Typed error classes (`ZenMoneyError`, `ZenMoneyAuthError`, `ZenMoneyApiError`)
- ESM-only build with bundled type declarations
- `pnpm` scripts for building, testing and linting

## Requirements

- Node.js 24+
- pnpm 10+

## Installation

```bash
pnpm add @krislintigo-zenmoney/zenmoney-client
```

## Quick start

```ts
import { ZenMoneyApiClient, ZenMoneyAuthClient } from '@krislintigo-zenmoney/zenmoney-client'

const authClient = new ZenMoneyAuthClient({
  clientId: process.env.ZM_CLIENT_ID,
  clientSecret: process.env.ZM_CLIENT_SECRET,
  redirectUri: 'https://example.com/oauth/callback',
})

const tokenSet = await authClient.refreshAccessToken({
  refreshToken: process.env.ZM_REFRESH_TOKEN,
})

const apiClient = new ZenMoneyApiClient()

const diff = await apiClient.diff({
  accessToken: tokenSet.accessToken,
  serverTimestamp: 0,
})

console.dir(diff, { depth: null })
```

## Suggest

```ts
const apiClient = new ZenMoneyApiClient()

const suggestion = await apiClient.suggest({
  accessToken: process.env.ZM_ACCESS_TOKEN,
  payload: { payee: 'McDonalds' },
})

console.dir(suggestion, { depth: null })
```

## Refreshing an access token

```ts
const authClient = new ZenMoneyAuthClient({
  clientId: process.env.ZM_CLIENT_ID,
  clientSecret: process.env.ZM_CLIENT_SECRET,
  refreshToken: process.env.ZM_REFRESH_TOKEN,
})

const tokenSet = await authClient.refreshAccessToken()

console.log(tokenSet.accessToken)
```

`ZenMoneyAuthClient` keeps `clientId`, `clientSecret`, `redirectUri` and `refreshToken` internally after construction or a successful call, so they can be omitted from subsequent calls.

## API

### `new ZenMoneyAuthClient(options?)`

Handles the OAuth2 flow and keeps `refreshToken` (and the related client credentials) between calls.

Options:

- `clientId`, `clientSecret`, `redirectUri` — OAuth2 client credentials
- `refreshToken` — reuse an existing refresh token
- `userAgent` — custom `User-Agent` header for token requests

Methods:

- `createAuthorizationUrl(params?)` — builds the OAuth2 authorization URL
- `authorizeWithCode(params)` — exchanges an authorization code for a token set
- `refreshAccessToken(params?)` — refreshes the access token
- `setRefreshToken(token)`
- `getRefreshToken()`
- `clearRefreshToken()`

### `new ZenMoneyApiClient()`

Stateless client for `diff`/`suggest`. `accessToken` is required in every call's payload.

Methods:

- `diff(payload)` — fetches account/transaction data since `serverTimestamp`
- `suggest(payload)` — requests a category/payee suggestion for a transaction (or array of transactions)

`diff(payload)` accepts `forceFetch` as an array of entity names, e.g. `['transaction', 'merchant'] as const`. Entities listed in `forceFetch` become required (non-`undefined`) in the response type.

## API reference compliance

The SDK follows the ZenMoney API description from the official wiki:

- OAuth2 authorize: `https://api.zenmoney.ru/oauth2/authorize/`
- OAuth2 token: `https://api.zenmoney.ru/oauth2/token/`
- Diff: `https://api.zenmoney.ru/v8/diff/`
- Suggest: `https://api.zenmoney.ru/v8/suggest/`
