import { describe, expect, it } from 'vitest'
import { runWithSecrets } from '../../../src/runner/child-process.js'

describe('runWithSecrets', () => {
  it('injects secrets into the child environment', async () => {
    const exitCode = await runWithSecrets(
      process.execPath,
      ['-e', 'process.exit(process.env.API_KEY === "super-secret" ? 0 : 5)'],
      new Map([['API_KEY', 'super-secret']]),
    )

    expect(exitCode).toBe(0)
  })

  it('propagates the child exit code', async () => {
    const exitCode = await runWithSecrets(process.execPath, ['-e', 'process.exit(7)'], new Map())

    expect(exitCode).toBe(7)
  })

  it('includes the command name when process startup fails', async () => {
    await expect(runWithSecrets('definitely-not-a-command', [], new Map())).rejects.toThrow(
      'Failed to start command "definitely-not-a-command"',
    )
  })

  it('passes command arguments through unchanged', async () => {
    const exitCode = await runWithSecrets(
      process.execPath,
      [
        '-e',
        'process.exit(process.argv[1] === "alpha beta" && process.argv[2] === "literal=1" ? 0 : 9)',
        'alpha beta',
        'literal=1',
      ],
      new Map(),
    )

    expect(exitCode).toBe(0)
  })
})
