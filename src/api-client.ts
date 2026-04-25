import type {
  DiffForceFetch,
  DiffRequest,
  DiffResponse,
  SuggestRequest,
  SuggestResponse,
  ZenMoneyApiClientOptions,
} from './types.js'
import { buildUrl, requestJson } from './utils.js'

export class ZenMoneyApiClient {
  private readonly apiBaseUrl = 'https://api.zenmoney.ru/v8/'
  private accessToken: string | undefined
  private readonly userAgent: string | undefined

  public constructor(options: ZenMoneyApiClientOptions = {}) {
    this.accessToken = options.accessToken
    this.userAgent = options.userAgent
  }

  public async diff<const ForceFetch extends DiffForceFetch = undefined>(
    payload: DiffRequest<ForceFetch>,
  ): Promise<DiffResponse<ForceFetch>> {
    return requestJson<DiffResponse<ForceFetch>>(buildUrl(this.apiBaseUrl, 'diff/'), {
      accessToken: this.accessToken,
      body: JSON.stringify({
        currentClientTimestamp: payload.currentClientTimestamp ?? Math.floor(Date.now() / 1000),
        ...payload,
      }),
      headers: {
        'content-type': 'application/json',
      },
      requireAuth: true,
      missingAuthMessage:
        'Access token is missing. Call authorizeWithCode(), refreshAccessToken() or setAccessToken() first.',
      userAgent: this.userAgent,
    })
  }

  public async suggest(payload: SuggestRequest): Promise<SuggestResponse>
  public async suggest(payload: SuggestRequest[]): Promise<SuggestResponse[]>
  public async suggest(
    payload: SuggestRequest | SuggestRequest[],
  ): Promise<SuggestResponse | SuggestResponse[]> {
    return requestJson<SuggestResponse | SuggestResponse[]>(buildUrl(this.apiBaseUrl, 'suggest/'), {
      accessToken: this.accessToken,
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
      requireAuth: true,
      missingAuthMessage:
        'Access token is missing. Call authorizeWithCode(), refreshAccessToken() or setAccessToken() first.',
      userAgent: this.userAgent,
    })
  }

  public setAccessToken(accessToken: string): void {
    this.accessToken = accessToken
  }

  public getAccessToken(): string | undefined {
    return this.accessToken
  }

  public clearAccessToken(): void {
    this.accessToken = undefined
  }
}
