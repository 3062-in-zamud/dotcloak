import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { Command } from 'commander'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { registerStatusCommand } from '../../../src/cli/commands/status.js'

function createProgram(): Command {
  const program = new Command()
  registerStatusCommand(program)
  return program
}

describe('status command', () => {
  let originalCwd: string
  let tmpDir: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-status-test-'))
    process.chdir(tmpDir)
    vi.restoreAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('reports a non-initialized project', async () => {
    const program = createProgram()

    await program.parseAsync(['node', 'dotcloak', 'status'])

    const stdout = vi.mocked(console.log).mock.calls.flat().join('\n')
    expect(stdout).toContain('Initialized: No')
    expect(stdout).toContain('Key file: Missing')
    expect(stdout).toContain('Encrypted .env: Missing')
  })

  it('reports initialized files and warns when plaintext .env still exists', async () => {
    const program = createProgram()

    fs.mkdirSync(path.join(tmpDir, '.dotcloak'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, '.dotcloak', 'key.age'), 'secret-key', 'utf-8')
    fs.writeFileSync(
      path.join(tmpDir, '.dotcloak', 'config.toml'),
      '[dotcloak]\nversion="1"\n',
      'utf-8',
    )
    fs.writeFileSync(path.join(tmpDir, '.env.cloak'), 'encrypted-content', 'utf-8')
    fs.writeFileSync(path.join(tmpDir, '.env'), 'API_KEY=plaintext\n', 'utf-8')

    await program.parseAsync(['node', 'dotcloak', 'status'])

    const stdout = vi.mocked(console.log).mock.calls.flat().join('\n')
    expect(stdout).toContain('Initialized: Yes')
    expect(stdout).toContain('Key file: Found')
    expect(stdout).toContain('Config: Found')
    expect(stdout).toContain('Encrypted .env: Found')
    expect(stdout).toContain('WARNING: Unencrypted .env file detected!')
  })
})
