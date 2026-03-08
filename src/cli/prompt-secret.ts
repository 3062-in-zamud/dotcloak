import { CliError } from './errors.js'

export type HiddenPromptInput = {
  isRaw?: boolean
  isTTY?: boolean
  off(event: 'data', listener: (chunk: string | Buffer) => void): unknown
  on(event: 'data', listener: (chunk: string | Buffer) => void): unknown
  pause(): void
  resume(): void
  setEncoding?(encoding: BufferEncoding): void
  setRawMode?(mode: boolean): void
}

export type HiddenPromptOutput = {
  isTTY?: boolean
  write(chunk: string): unknown
}

export type HiddenPromptIO = {
  input: HiddenPromptInput
  output: HiddenPromptOutput
}

export async function promptHiddenValue(
  prompt: string,
  io: HiddenPromptIO = { input: process.stdin, output: process.stdout },
): Promise<string> {
  const { input, output } = io
  const setRawMode = input.setRawMode

  if (!input.isTTY || !output.isTTY || !setRawMode) {
    throw new CliError(
      'Cannot prompt for a secret in a non-interactive terminal.',
      "Use 'dotcloak set KEY=VALUE' or rerun the command in a TTY.",
    )
  }

  return await new Promise((resolve, reject) => {
    let value = ''
    const previousRawMode = input.isRaw ?? false

    const cleanup = (): void => {
      input.off('data', onData)
      setRawMode(previousRawMode)
      input.pause()
      output.write('\n')
    }

    const appendChunk = (chunk: string): void => {
      for (const character of chunk) {
        if (character === '\r' || character === '\n') {
          cleanup()
          resolve(value)
          return
        }

        if (character === '\u0003' || character === '\u0004') {
          cleanup()
          reject(
            new CliError(
              'Secret entry was cancelled.',
              "Run 'dotcloak set KEY' again to retry the hidden prompt.",
            ),
          )
          return
        }

        if (character === '\u0008' || character === '\u007f') {
          value = value.slice(0, -1)
          continue
        }

        if (character < ' ' && character !== '\t') {
          continue
        }

        value += character
      }
    }

    const onData = (chunk: string | Buffer): void => {
      appendChunk(typeof chunk === 'string' ? chunk : chunk.toString('utf-8'))
    }

    output.write(prompt)
    input.setEncoding?.('utf-8')
    input.resume()
    setRawMode(true)
    input.on('data', onData)
  })
}
