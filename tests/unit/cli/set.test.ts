import * as path from 'node:path'
import { Command } from 'commander'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { promptHiddenValueMock, setSecretMock } = vi.hoisted(() => ({
  promptHiddenValueMock: vi.fn(),
  setSecretMock: vi.fn(),
}))

vi.mock('../../../src/cli/prompt-secret.js', () => ({
  promptHiddenValue: promptHiddenValueMock,
}))

vi.mock('../../../src/core/secret-manager.js', () => ({
  setSecret: setSecretMock,
}))

import { registerSetCommand } from '../../../src/cli/commands/set.js'

function createProgram(): Command {
  const program = new Command()
  registerSetCommand(program)
  return program
}

describe('set command', () => {
  beforeEach(() => {
    promptHiddenValueMock.mockReset()
    setSecretMock.mockReset()
    vi.restoreAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('stores a KEY=VALUE pair without prompting', async () => {
    const program = createProgram()

    await program.parseAsync(['node', 'dotcloak', 'set', 'API_KEY=super-secret'])

    expect(promptHiddenValueMock).not.toHaveBeenCalled()
    expect(setSecretMock).toHaveBeenCalledWith(
      process.cwd(),
      path.resolve(process.cwd(), '.env.cloak'),
      'API_KEY',
      'super-secret',
    )
  })

  it('prompts for a hidden value when only KEY is provided', async () => {
    const program = createProgram()
    promptHiddenValueMock.mockResolvedValue('from-prompt')

    await program.parseAsync(['node', 'dotcloak', 'set', 'API_KEY'])

    expect(promptHiddenValueMock).toHaveBeenCalledWith('Enter value for API_KEY: ')
    expect(setSecretMock).toHaveBeenCalledWith(
      process.cwd(),
      path.resolve(process.cwd(), '.env.cloak'),
      'API_KEY',
      'from-prompt',
    )
  })

  it('shows an actionable error for an empty key', async () => {
    const program = createProgram()
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`)
    }) as never)

    await expect(program.parseAsync(['node', 'dotcloak', 'set', '=value'])).rejects.toThrow(
      'process.exit:1',
    )

    const stderr = vi.mocked(console.error).mock.calls.flat().join('\n')
    expect(stderr).toContain('What happened: Secret key is empty.')
    expect(stderr).toContain('How to fix: Use')
    exitSpy.mockRestore()
  })
})
