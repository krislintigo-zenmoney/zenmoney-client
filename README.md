# zenmoney-client

test: 42.0

Modern TypeScript/Node.js SDK for [ZenMoney API](https://github.com/zenmoney/ZenPlugins/wiki/ZenMoney-API).

В библиотеке уже подготовлены:

- отдельный `ZenMoneyAuthClient` для OAuth2 flow
- отдельный `ZenMoneyApiClient` для `diff` и `suggest`
- совместимый фасад `ZenMoneyClient`, объединяющий оба клиента
- сборка в ESM и CommonJS
- готовые типы для публикации в npm
- `pnpm`-скрипты для сборки, тестов и проверки пакета перед публикацией

## Требования

- Node.js 20+
- pnpm 10+

## Установка

```bash
pnpm install
```

## Быстрый старт

```ts
import { ZenMoneyApiClient, ZenMoneyAuthClient } from '@krislintigo-zenmoney/zenmoney-client';

const authClient = new ZenMoneyAuthClient({
  clientId: process.env.ZM_CLIENT_ID,
  clientSecret: process.env.ZM_CLIENT_SECRET,
  redirectUri: 'https://example.com/oauth/callback',
});

const tokenSet = await authClient.refreshAccessToken({
  refreshToken: process.env.ZM_REFRESH_TOKEN,
});

const apiClient = new ZenMoneyApiClient({
  accessToken: tokenSet.accessToken,
});

const diff = await apiClient.diff({ serverTimestamp: 0 });
console.dir(diff, { depth: null });
```

## Использование с уже готовым токеном

```ts
import { ZenMoneyClient } from '@krislintigo-zenmoney/zenmoney-client';

const client = new ZenMoneyApiClient({
  accessToken: process.env.ZM_ACCESS_TOKEN,
});

const suggestion = await client.suggest({
  payee: 'McDonalds',
});

console.dir(suggestion, { depth: null });
```

## Обновление access token

```ts
const client = new ZenMoneyClient({
  clientId: process.env.ZM_CLIENT_ID,
  clientSecret: process.env.ZM_CLIENT_SECRET,
  refreshToken: process.env.ZM_REFRESH_TOKEN,
});

const tokenSet = await client.refreshAccessToken();

console.log(tokenSet.accessToken);
```

## API

### `new ZenMoneyAuthClient(options)`

Отвечает за OAuth2-операции и хранение `refreshToken`.

### `new ZenMoneyApiClient(options)`

Отвечает за `diff`/`suggest` и хранение `accessToken`.

Параметры:

- `clientId`, `clientSecret`, `redirectUri` для OAuth2
- `accessToken`, `refreshToken` для повторного использования сессии
- `apiBaseUrl`, `authBaseUrl` для тестирования или проксирования API
- `userAgent` для кастомного заголовка

### Основные методы

- `createAuthorizationUrl(params)`
- `authorizeWithCode(params)`
- `refreshAccessToken(params)`
- `diff(payload)`
- `suggest(payload)`
- `setAccessToken(token)`
- `setRefreshToken(token)`
- `setTokens(tokenSet)`
- `clearTokens()`
- `getAccessToken()`
- `getRefreshToken()`

`diff(payload)` принимает `forceFetch` как массив строк, например `['transaction', 'merchant'] as const`. Сущности, перечисленные в `forceFetch`, в типе ответа становятся обязательными и возвращаются без `undefined`.

## Скрипты

```bash
pnpm build
pnpm lint
pnpm release:dry-run
pnpm test
pnpm typecheck
pnpm pack:check
```

## Публикация в npm

1. При необходимости поменяйте `name` в `package.json` на свободное имя пакета.
2. Настройте секрет `NPM_TOKEN` в GitHub Actions.
3. Используйте Conventional Commits, например `feat: add suggest helper` или `fix: normalize oauth token parsing`.
4. Для локальной проверки релиза выполните:

```bash
pnpm release:dry-run
```

5. После пуша в `main` или `master` workflow `Release` сам:

- определит semver bump по коммитам
- обновит `CHANGELOG.md`
- создаст git tag и GitHub release
- опубликует пакет в npm

## Semantic Changelog

В проект добавлен `semantic-release` с автоматической генерацией `CHANGELOG.md`.

- `feat:` даёт `minor`
- `fix:` даёт `patch`
- `feat!:` или `BREAKING CHANGE:` даёт `major`

Конфигурация лежит в `.releaserc.json`, а автоматический релиз запускается через `.github/workflows/release.yml`.

## Соответствие спецификации

SDK опирается на описание ZenMoney API из официальной wiki:

- OAuth2 authorize: `https://api.zenmoney.ru/oauth2/authorize/`
- OAuth2 token: `https://api.zenmoney.ru/oauth2/token/`
- Diff: `https://api.zenmoney.ru/v8/diff/`
- Suggest: `https://api.zenmoney.ru/v8/suggest/`
