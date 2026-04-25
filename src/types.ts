export type UnixTimestamp = number
export type ISODateString = `${number}-${number}-${number}`
export type UUID = string

export type AccountType = 'cash' | 'ccard' | 'checking' | 'loan' | 'deposit' | 'emoney' | 'debt'

export type DateOffsetInterval = 'day' | 'week' | 'month' | 'year'
export type PayoffInterval = 'month' | 'year'
export type ReminderMarkerState = 'planned' | 'processed' | 'deleted'

export type ForceFetchEntity =
  | 'instrument'
  | 'company'
  | 'user'
  | 'account'
  | 'tag'
  | 'merchant'
  | 'budget'
  | 'reminder'
  | 'reminderMarker'
  | 'transaction'

interface EntityDefault<TId extends number | UUID> {
  id: TId
  changed: UnixTimestamp
}

interface UserOwnedEntity {
  /**
   * Reference - `User.id`
   * **/
  user: number
}

export interface Instrument extends EntityDefault<number> {
  title: string
  shortTitle: string
  symbol: string
  rate: number
}

export interface Company extends EntityDefault<number> {
  title: string
  fullTitle: string | null
  www: string | null
  country: string | null
  deleted: boolean
}

// TODO: update
export interface User extends EntityDefault<number> {
  /**
   * Custom login or email
   * **/
  login: string

  email: string

  /**
   * Reference - `Instrument.id`
   * **/
  currency: number

  /**
   * Reference - `User.id`
   *
   * If `null`, the user is the main account
   * **/
  parent: number | null

  country: null
  countryCode: string

  monthStartDay: 1
  isForecastEnabled: false
  planBalanceMode: string
  planSettings: string

  subscription: string
  paidTill: UnixTimestamp
  subscriptionRenewalDate: null
}

export interface Account extends EntityDefault<UUID>, UserOwnedEntity {
  /**
   * Reference - `User.id`
   * **/
  role: number | null

  /**
   * Reference - `Instrument.id`
   * **/
  instrument: number

  /**
   * Reference - `Company.id`
   * **/
  company: number | null

  type: AccountType

  title: string

  syncID: string[] | null

  balance: number
  startBalance: number | null
  creditLimit: number | null

  capitalization: boolean | null
  percent: number | null
  startDate: ISODateString | null
  endDateOffset: number | null
  endDateOffsetInterval: DateOffsetInterval | null
  payoffStep: number | null
  payoffInterval: PayoffInterval | null

  inBalance: boolean
  savings: boolean
  enableCorrection: boolean
  enableSMS: boolean
  archive: boolean
}

export interface Tag extends EntityDefault<UUID>, UserOwnedEntity {
  title: string

  /**
   * Reference - `Tag.id`
   * **/
  parent: UUID | null

  icon: string | null
  color: number | null
  picture: string | null

  showIncome: boolean
  showOutcome: boolean
  budgetIncome: boolean
  budgetOutcome: boolean
  required: boolean | null

  staticId: string | null
}

export interface Merchant extends EntityDefault<UUID>, UserOwnedEntity {
  title: string
}

// TODO: update
export interface Reminder extends EntityDefault<UUID>, UserOwnedEntity {
  incomeInstrument: number
  incomeAccount: UUID
  income: number
  outcomeInstrument: number
  outcomeAccount: UUID
  outcome: number
  tag: UUID[] | null
  merchant: UUID | null
  payee: string | null
  comment: string | null
  interval: DateOffsetInterval | null
  step: number | null
  points: number[] | null
  startDate: ISODateString
  endDate: ISODateString | null
  notify: boolean
}

// TODO: update
export interface ReminderMarker extends EntityDefault<UUID>, UserOwnedEntity {
  incomeInstrument: number
  incomeAccount: UUID
  income: number
  outcomeInstrument: number
  outcomeAccount: UUID
  outcome: number
  tag: UUID[] | null
  merchant: UUID | null
  payee: string | null
  comment: string | null
  date: ISODateString
  reminder: UUID
  state: ReminderMarkerState
  notify: boolean
}

// TODO: update
export interface Transaction extends EntityDefault<UUID>, UserOwnedEntity {
  created: UnixTimestamp
  deleted: boolean
  hold?: boolean | null
  incomeInstrument: number
  incomeAccount: UUID
  income: number
  outcomeInstrument: number
  outcomeAccount: UUID
  outcome: number
  tag: UUID[] | null
  merchant: UUID | null
  payee: string | null
  originalPayee: string | null
  comment: string | null
  date: ISODateString
  mcc: number | null
  reminderMarker: UUID | null
  opIncome: number | null
  opIncomeInstrument: number | null
  opOutcome: number | null
  opOutcomeInstrument: number | null
  latitude: number | null
  longitude: number | null
}

export interface Budget extends UserOwnedEntity {
  changed: UnixTimestamp

  /**
   * Reference - `Tag.id`
   *
   * If `null`, budget for transactions without tags
   * **/
  tag: UUID | null

  date: ISODateString

  income: number
  incomeLock: boolean
  isIncomeForecast: false
  outcome: number
  outcomeLock: boolean
  isOutcomeForecast: false
}

export interface Deletion {
  id: string
  object: ForceFetchEntity
  stamp: UnixTimestamp
  user: number
}

export interface DiffEntityMap {
  instrument: Instrument[]
  company: Company[]
  user: User[]
  account: Account[]
  tag: Tag[]
  merchant: Merchant[]
  budget: Budget[]
  reminder: Reminder[]
  reminderMarker: ReminderMarker[]
  transaction: Transaction[]
  deletion: Deletion[]
}

export type DiffForceFetch = readonly ForceFetchEntity[] | undefined

type ForceFetchedEntity<ForceFetch extends DiffForceFetch> =
  ForceFetch extends readonly ForceFetchEntity[] ? ForceFetch[number] : never

export interface DiffRequest<ForceFetch extends DiffForceFetch = undefined> {
  currentClientTimestamp?: UnixTimestamp
  serverTimestamp: UnixTimestamp
  forceFetch?: ForceFetch
  instrument?: Instrument[]
  company?: Company[]
  user?: User[]
  account?: Account[]
  tag?: Tag[]
  merchant?: Merchant[]
  budget?: Budget[]
  reminder?: Reminder[]
  reminderMarker?: ReminderMarker[]
  transaction?: Transaction[]
  deletion?: Deletion[]
}

type DiffResponseEntities<ForceFetch extends DiffForceFetch> = Partial<DiffEntityMap> &
  Required<Pick<DiffEntityMap, Extract<ForceFetchedEntity<ForceFetch>, keyof DiffEntityMap>>>

export type DiffResponse<ForceFetch extends DiffForceFetch = undefined> = {
  serverTimestamp: UnixTimestamp
} & DiffResponseEntities<ForceFetch>

export type SuggestRequest = Partial<Transaction>
export type SuggestResponse = Partial<Transaction>

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

export interface ZenMoneyApiClientOptions {
  accessToken?: string
  apiBaseUrl?: string
  userAgent?: string
}
