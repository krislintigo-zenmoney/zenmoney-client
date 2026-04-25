export class ZenMoneyError extends Error {
  public readonly cause?: unknown

  public constructor(message: string, options?: { cause?: unknown }) {
    super(message)
    this.name = 'ZenMoneyError'
    this.cause = options?.cause
  }
}

export class ZenMoneyAuthError extends ZenMoneyError {
  public constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ZenMoneyAuthError'
  }
}

export class ZenMoneyApiError extends ZenMoneyError {
  public readonly status: number
  public readonly payload: unknown

  public constructor(
    message: string,
    options: { status: number; payload: unknown; cause?: unknown },
  ) {
    super(message, { cause: options.cause })
    this.name = 'ZenMoneyApiError'
    this.status = options.status
    this.payload = options.payload
  }
}
