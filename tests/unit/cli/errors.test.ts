import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CliError,
  fail,
  normalizeCliError,
  renderCliError,
  withCliErrorHandling,
} from '../../../src/cli/errors.js'

describe('errors', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('fail throws a CliError with the expected fields', () => {
    expect(() => fail('bad thing', 'fix it')).toThrowError(CliError)

    try {
      fail('bad thing', 'fix it')
    } catch (error) {
      expect(error).toBeInstanceOf(CliError)
      expect((error as CliError).whatHappened).toBe('bad thing')
      expect((error as CliError).howToFix).toBe('fix it')
    }
  })

  it('returns CliError instances unchanged', () => {
    const cliError = new CliError('already formatted', 'do the thing')

    expect(normalizeCliError(cliError, 'fallback')).toBe(cliError)
  })

  it('normalizes missing key file errors', () => {
    const error = normalizeCliError(new Error('Key file not found: /tmp/key.age'), 'fallback')

    expect(error.whatHappened).toBe('Encryption key was not found.')
    expect(error.howToFix).toBe("Run 'dotcloak init' or 'dotcloak key import <file>' first.")
  })

  it('normalizes missing cloak file errors', () => {
    const error = normalizeCliError(new Error('Cloak file not found: /tmp/.env.cloak'), 'fallback')

    expect(error.whatHappened).toBe('Encrypted env file was not found.')
    expect(error.howToFix).toBe(
      "Run 'dotcloak init' or pass '--file <path>' to an existing .env.cloak file.",
    )
  })

  it('normalizes failed command startup errors', () => {
    const error = normalizeCliError(
      new Error('Failed to start command "node": not found'),
      'fallback',
    )

    expect(error.whatHappened).toBe('Failed to start command "node": not found')
    expect(error.howToFix).toBe(
      'Verify the command exists and is available on your PATH, then try again.',
    )
  })

  it('falls back to a generic unexpected error', () => {
    const error = normalizeCliError('totally unexpected', 'use the fallback')

    expect(error.whatHappened).toBe('Unexpected error occurred.')
    expect(error.howToFix).toBe('use the fallback')
  })

  it('renders normalized errors to stderr', () => {
    renderCliError(new Error('Key file not found: /tmp/key.age'), 'fallback')

    expect(vi.mocked(console.error).mock.calls[0]?.[0]).toBe(
      'What happened: Encryption key was not found.',
    )
    expect(vi.mocked(console.error).mock.calls[1]?.[0]).toBe(
      "How to fix: Run 'dotcloak init' or 'dotcloak key import <file>' first.",
    )
  })

  it('returns the wrapped action result on success', async () => {
    const action = vi.fn(async (name: string) => {
      expect(name).toBe('dotcloak')
    })
    const wrapped = withCliErrorHandling(action, 'fallback')

    await expect(wrapped('dotcloak')).resolves.toBeUndefined()
    expect(action).toHaveBeenCalledWith('dotcloak')
  })

  it('renders the error and exits when the wrapped action fails', async () => {
    const wrapped = withCliErrorHandling(() => {
      throw new Error('boom')
    }, 'fallback fix')

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`)
    }) as never)

    await expect(wrapped()).rejects.toThrow('process.exit:1')

    const stderr = vi.mocked(console.error).mock.calls.flat().join('\n')
    expect(stderr).toContain('What happened: Unexpected error occurred.')
    expect(stderr).toContain('How to fix: fallback fix')

    exitSpy.mockRestore()
  })
})
