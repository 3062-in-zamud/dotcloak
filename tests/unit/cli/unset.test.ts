import * as path from 'node:path'
import { Command } from 'commander'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { unsetSecretMock } = vi.hoisted(() => ({
  unsetSecretMock: vi.fn(),
}))

vi.mock('../../../src/core/secret-manager.js', () => ({
  unsetSecret: unsetSecretMock,
}))

import { registerUnsetCommand } from '../../../src/cli/commands/unset.js'

function createProgram(): Command {
  const program = new Command()
  registerUnsetCommand(program)
  return program
}

describe('unset command', () => {
  beforeEach(() => {
    unsetSecretMock.mockReset()
    vi.restoreAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('removes an existing secret', async () => {
    const program = createProgram()
    unsetSecretMock.mockResolvedValue(true)

    await program.parseAsync(['node', 'dotcloak', 'unset', 'API_KEY'])

    expect(unsetSecretMock).toHaveBeenCalledWith(
      process.cwd(),
      path.resolve(process.cwd(), '.env.cloak'),
      'API_KEY',
    )
    expect(vi.mocked(console.log)).toHaveBeenCalledWith('Removed API_KEY')
  })

  it('shows an actionable error when the key does not exist', async () => {
    const program = createProgram()
    unsetSecretMock.mockResolvedValue(false)

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`)
    }) as never)

    await expect(program.parseAsync(['node', 'dotcloak', 'unset', 'MISSING_KEY'])).rejects.toThrow(
      'process.exit:1',
    )

    const stderr = vi.mocked(console.error).mock.calls.flat().join('\n')
    expect(stderr).toContain("What happened: Secret 'MISSING_KEY' was not found.")
    expect(stderr).toContain('How to fix: Use')

    exitSpy.mockRestore()
  })
})
