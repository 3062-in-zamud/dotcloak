export class CliError extends Error {
  constructor(
    public readonly whatHappened: string,
    public readonly howToFix: string,
    options?: { cause?: unknown },
  ) {
    super(whatHappened)
    this.name = 'CliError'

    if (options?.cause !== undefined) {
      ;(this as Error & { cause?: unknown }).cause = options.cause
    }
  }
}

export function fail(whatHappened: string, howToFix: string): never {
  throw new CliError(whatHappened, howToFix)
}

export function normalizeCliError(error: unknown, fallbackFix: string): CliError {
  if (error instanceof CliError) {
    return error
  }

  if (error instanceof Error) {
    if (error.message.startsWith('Key file not found:')) {
      return new CliError(
        'Encryption key was not found.',
        "Run 'dotcloak init' or 'dotcloak key import <file>' first.",
        { cause: error },
      )
    }

    if (error.message.startsWith('Cloak file not found:')) {
      return new CliError(
        'Encrypted env file was not found.',
        "Run 'dotcloak init' or pass '--file <path>' to an existing .env.cloak file.",
        { cause: error },
      )
    }

    if (error.message.startsWith('Failed to start command')) {
      return new CliError(
        error.message,
        'Verify the command exists and is available on your PATH, then try again.',
        { cause: error },
      )
    }
  }

  return new CliError('Unexpected error occurred.', fallbackFix, { cause: error })
}

export function renderCliError(error: unknown, fallbackFix: string): void {
  const cliError = normalizeCliError(error, fallbackFix)
  console.error(`What happened: ${cliError.whatHappened}`)
  console.error(`How to fix: ${cliError.howToFix}`)
}

export function withCliErrorHandling<T extends unknown[]>(
  action: (...args: T) => Promise<void> | void,
  fallbackFix: string,
): (...args: T) => Promise<void> {
  return async (...args: T): Promise<void> => {
    try {
      await action(...args)
    } catch (error) {
      renderCliError(error, fallbackFix)
      process.exit(1)
    }
  }
}
