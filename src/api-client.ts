import type {
  DiffForceFetch,
  DiffRequest,
  DiffResponse,
  SuggestRequest,
  SuggestTransaction,
} from './types/api-client.types.js'
import { buildUrl, requestJson } from './utils.js'

export class ZenMoneyApiClient {
  private readonly apiBaseUrl = 'https://api.zenmoney.ru/v8/'

  public async diff<const ForceFetch extends DiffForceFetch = undefined>(
    payload: DiffRequest<ForceFetch>,
  ): Promise<DiffResponse<ForceFetch>> {
    const { accessToken, ...rest } = payload
    return requestJson<DiffResponse<ForceFetch>>(buildUrl(this.apiBaseUrl, 'diff/'), {
      accessToken,
      body: JSON.stringify({
        currentClientTimestamp: payload.currentClientTimestamp ?? Math.floor(Date.now() / 1000),
        ...rest,
      }),
      headers: {
        'content-type': 'application/json',
      },
      requireAuth: true,
      missingAuthMessage:
        'Access token is missing. Call authorizeWithCode(), refreshAccessToken() or setAccessToken() first.',
    })
  }

  public async suggest(payload: SuggestRequest<SuggestTransaction>): Promise<SuggestTransaction>
  public async suggest(payload: SuggestRequest<SuggestTransaction[]>): Promise<SuggestTransaction[]>
  public async suggest(
    payload: SuggestRequest<SuggestTransaction> | SuggestRequest<SuggestTransaction[]>,
  ): Promise<SuggestTransaction | SuggestTransaction[]> {
    const { accessToken, payload: suggestPayload } = payload

    return requestJson<SuggestTransaction | SuggestTransaction[]>(
      buildUrl(this.apiBaseUrl, 'suggest/'),
      {
        accessToken,
        body: JSON.stringify(suggestPayload),
        headers: {
          'content-type': 'application/json',
        },
        requireAuth: true,
        missingAuthMessage:
          'Access token is missing. Call authorizeWithCode(), refreshAccessToken() or setAccessToken() first.',
      },
    )
  }
}

const client = new ZenMoneyApiClient()

const res = await client.suggest({ accessToken: 'secret-token', payload: { payee: 'Gippo' } })
