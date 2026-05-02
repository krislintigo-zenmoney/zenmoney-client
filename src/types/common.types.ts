export type UnixTimestamp = number
export type ISODateString = `${number}-${number}-${number}`
export type UUID = string

export type AccountType = 'cash' | 'ccard' | 'checking' | 'loan' | 'deposit' | 'emoney' | 'debt'

export type DateOffsetInterval = 'day' | 'week' | 'month' | 'year'
export type PayoffInterval = 'month' | 'year'
export type ReminderMarkerState = 'planned' | 'processed' | 'deleted'

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

  monthStartDay: number
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

export interface Transaction extends EntityDefault<UUID>, UserOwnedEntity {
  created: UnixTimestamp
  deleted: boolean
  hold?: boolean | null
  viewed: boolean

  /**
   * Reference - `Instrument.id`
   * **/
  incomeInstrument: number
  /**
   * Reference - `Account.id`
   * **/
  incomeAccount: UUID
  income: number
  /**
   * Reference - `Instrument.id`
   * **/
  outcomeInstrument: number
  /**
   * Reference - `Account.id`
   * **/
  outcomeAccount: UUID
  outcome: number

  /**
   * Reference - `Tag.id`
   * **/
  tag: UUID[] | null
  /**
   * Reference - `Merchant.id`
   * **/
  merchant: UUID | null
  payee: string | null
  originalPayee: string | null
  comment: string | null

  date: ISODateString
  mcc: number | null

  reminderMarker: UUID | null

  /**
   * Income amount in operation currency
   * **/
  opIncome: number | null
  /**
   * Operation currency
   * **/
  opIncomeInstrument: number | null
  /**
   * Outcome amount in operation currency
   * **/
  opOutcome: number | null
  /**
   * Operation currency
   * **/
  opOutcomeInstrument: number | null

  latitude: number | null
  longitude: number | null
  qrCode: string | null
  source: string | null
  incomeBankID: string | null
  outcomeBankID: string | null
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

interface ReminderBase extends EntityDefault<UUID>, UserOwnedEntity {
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

  notify: boolean
}

export interface Reminder extends ReminderBase {
  /** `null` - one-time transaction **/
  interval: DateOffsetInterval | null

  step: number | null

  points: number[] | null

  startDate: ISODateString
  endDate: ISODateString | null
}

export interface ReminderMarker extends ReminderBase {
  date: ISODateString

  /**
   * Reference - `Reminder.id`
   * **/
  reminder: UUID

  state: ReminderMarkerState
}
