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

export interface Instrument {
  id: number
  changed: UnixTimestamp
  title: string
  shortTitle: string
  symbol: string
  rate: number
}

export interface Company {
  id: number
  changed: UnixTimestamp
  title: string
  fullTitle: string | null
  www: string | null
  country: string | null
}

export interface User {
  id: number
  changed: UnixTimestamp
  login: string | null
  currency: number
  parent: number | null
}

export interface Account {
  id: UUID
  changed: UnixTimestamp
  user: number
  role?: number | null
  instrument: number | null
  company: number | null
  type: AccountType
  title: string
  syncID: string[] | null
  balance: number | null
  startBalance: number | null
  creditLimit: number | null
  inBalance: boolean
  savings?: boolean | null
  enableCorrection: boolean
  enableSMS: boolean
  archive: boolean
  capitalization: boolean | null
  percent: number | null
  startDate: ISODateString | null
  endDateOffset: number | null
  endDateOffsetInterval: DateOffsetInterval | null
  payoffStep: number | null
  payoffInterval: PayoffInterval | null
}

export interface Tag {
  id: UUID
  changed: UnixTimestamp
  user: number
  title: string
  parent?: UUID | null
  icon?: string | null
  picture?: string | null
  color?: number | null
  showIncome: boolean
  showOutcome: boolean
  budgetIncome: boolean
  budgetOutcome: boolean
  required?: boolean | null
}

export interface Merchant {
  id: UUID
  changed: UnixTimestamp
  user: number
  title: string
}

export interface Reminder {
  id: UUID
  changed: UnixTimestamp
  user: number
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

export interface ReminderMarker {
  id: UUID
  changed: UnixTimestamp
  user: number
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

export interface Transaction {
  id: UUID
  changed: UnixTimestamp
  created: UnixTimestamp
  user: number
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

export interface Budget {
  changed: UnixTimestamp
  user: number
  tag: UUID | null
  date: ISODateString
  income: number
  incomeLock: boolean
  outcome: number
  outcomeLock: boolean
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

export interface ZenMoneyClientOptions
  extends ZenMoneyAuthClientOptions,
    ZenMoneyApiClientOptions {}
