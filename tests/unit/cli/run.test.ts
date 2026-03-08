import * as path from 'node:path'
import { Command } from 'commander'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSecretsMock, runWithSecretsMock } = vi.hoisted(() => ({
  getSecretsMock: vi.fn(),
  runWithSecretsMock: vi.fn(),
}))

vi.mock('../../../src/core/secret-manager.js', () => ({
  getSecrets: getSecretsMock,
}))

vi.mock('../../../src/runner/child-process.js', () => ({
  runWithSecrets: runWithSecretsMock,
}))

import { registerRunCommand } from '../../../src/cli/commands/run.js'

function createProgram(): Command {
  const program = new Command()
  registerRunCommand(program)
  return program
}

describe('run command', () => {
  beforeEach(() => {
    getSecretsMock.mockReset()
    runWithSecretsMock.mockReset()
    vi.restoreAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('passes the decrypted secrets and command arguments through to the runner', async () => {
    const program = createProgram()
    const secrets = new Map([['API_KEY', 'super-secret']])

    getSecretsMock.mockResolvedValue(secrets)
    runWithSecretsMock.mockResolvedValue(7)

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)

    await program.parseAsync([
      'node',
      'dotcloak',
      'run',
      'node',
      'app.js',
      'alpha beta',
      'literal=1',
    ])

    expect(getSecretsMock).toHaveBeenCalledWith(
      process.cwd(),
      path.resolve(process.cwd(), '.env.cloak'),
    )
    expect(runWithSecretsMock).toHaveBeenCalledWith(
      'node',
      ['app.js', 'alpha beta', 'literal=1'],
      secrets,
    )
    expect(exitSpy).toHaveBeenCalledWith(7)

    exitSpy.mockRestore()
  })
})
