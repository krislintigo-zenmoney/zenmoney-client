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
} from './common.types'

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
  accessToken: string
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

export type SuggestTransaction = Partial<Transaction>

export interface SuggestRequest<TPayload extends SuggestTransaction | SuggestTransaction[]> {
  accessToken: string
  payload: TPayload
}
