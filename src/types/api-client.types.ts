import type {
  Account,
  Budget,
  Company,
  Instrument,
  Merchant,
  Reminder,
  ReminderMarker,
  Tag,
  Transaction,
  UnixTimestamp,
  User,
} from './common.types.js'

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

export interface Deletion {
  id: string
  object: ForceFetchEntity
  stamp: UnixTimestamp
  user: number
}

export interface DiffEntityMap {
  instrument: Array<Instrument>
  company: Array<Company>
  user: Array<User>
  account: Array<Account>
  tag: Array<Tag>
  merchant: Array<Merchant>
  budget: Array<Budget>
  reminder: Array<Reminder>
  reminderMarker: Array<ReminderMarker>
  transaction: Array<Transaction>
  deletion: Array<Deletion>
}

export type DiffForceFetch = ReadonlyArray<ForceFetchEntity> | undefined

type ForceFetchedEntity<ForceFetch extends DiffForceFetch> =
  ForceFetch extends ReadonlyArray<ForceFetchEntity> ? ForceFetch[number] : never

export interface DiffRequest<ForceFetch extends DiffForceFetch = undefined> {
  accessToken: string
  currentClientTimestamp?: UnixTimestamp
  serverTimestamp: UnixTimestamp
  forceFetch?: ForceFetch
  instrument?: Array<Instrument>
  company?: Array<Company>
  user?: Array<User>
  account?: Array<Account>
  tag?: Array<Tag>
  merchant?: Array<Merchant>
  budget?: Array<Budget>
  reminder?: Array<Reminder>
  reminderMarker?: Array<ReminderMarker>
  transaction?: Array<Transaction>
  deletion?: Array<Deletion>
}

type DiffResponseEntities<ForceFetch extends DiffForceFetch> = Partial<DiffEntityMap> &
  Required<Pick<DiffEntityMap, Extract<ForceFetchedEntity<ForceFetch>, keyof DiffEntityMap>>>

export type DiffResponse<ForceFetch extends DiffForceFetch = undefined> = {
  serverTimestamp: UnixTimestamp
} & DiffResponseEntities<ForceFetch>

export type SuggestTransaction = Partial<Transaction>

export interface SuggestRequest<TPayload extends SuggestTransaction | Array<SuggestTransaction>> {
  accessToken: string
  payload: TPayload
}
