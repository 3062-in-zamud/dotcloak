import * as path from 'node:path'
import { Command } from 'commander'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSecretsMock } = vi.hoisted(() => ({
  getSecretsMock: vi.fn(),
}))

vi.mock('../../../src/core/secret-manager.js', async () => {
  const actual = await vi.importActual<typeof import('../../../src/core/secret-manager.js')>(
    '../../../src/core/secret-manager.js',
  )

  return {
    ...actual,
    getSecrets: getSecretsMock,
  }
})

import { registerListCommand } from '../../../src/cli/commands/list.js'

function createProgram(): Command {
  const program = new Command()
  registerListCommand(program)
  return program
}

describe('list command', () => {
  beforeEach(() => {
    getSecretsMock.mockReset()
    vi.restoreAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('shows a friendly message when no secrets exist', async () => {
    const program = createProgram()
    getSecretsMock.mockResolvedValue(new Map())

    await program.parseAsync(['node', 'dotcloak', 'list'])

    expect(getSecretsMock).toHaveBeenCalledWith(
      process.cwd(),
      path.resolve(process.cwd(), '.env.cloak'),
    )
    expect(vi.mocked(console.log)).toHaveBeenCalledWith('No secrets found.')
  })

  it('masks secret values by default', async () => {
    const program = createProgram()
    getSecretsMock.mockResolvedValue(
      new Map([
        ['API_KEY', 'super-secret'],
        ['PIN', '1234'],
      ]),
    )

    await program.parseAsync(['node', 'dotcloak', 'list'])

    const stdout = vi.mocked(console.log).mock.calls.flat().join('\n')
    expect(stdout).toContain('API_KEY=su********et')
    expect(stdout).toContain('PIN=****')
  })

  it('shows unmasked values when --show is passed', async () => {
    const program = createProgram()
    getSecretsMock.mockResolvedValue(new Map([['API_KEY', 'super-secret']]))

    await program.parseAsync(['node', 'dotcloak', 'list', '--show'])

    expect(vi.mocked(console.log)).toHaveBeenCalledWith('API_KEY=super-secret')
  })
})
