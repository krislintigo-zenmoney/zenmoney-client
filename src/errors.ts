// eslint-disable-next-line max-classes-per-file
export class ZenMoneyError extends Error {
  public override readonly cause?: unknown

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ZenMoneyError'
    this.cause = options?.cause
  }
}

export class ZenMoneyAuthError extends ZenMoneyError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ZenMoneyAuthError'
  }
}

export class ZenMoneyApiError extends ZenMoneyError {
  public readonly status: number
  public readonly payload: unknown

  constructor(message: string, options: { status: number; payload: unknown; cause?: unknown }) {
    super(message, options)
    this.name = 'ZenMoneyApiError'
    this.status = options.status
    this.payload = options.payload
  }
}
