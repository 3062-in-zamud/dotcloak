import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { Command } from 'commander'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { registerKeyCommand } from '../../../src/cli/commands/key.js'
import { saveIdentity } from '../../../src/crypto/key-manager.js'

function createProgram(): Command {
  const program = new Command()
  registerKeyCommand(program)
  return program
}

describe('key command', () => {
  let originalCwd: string
  let tmpDir: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-key-test-'))
    process.chdir(tmpDir)
    vi.restoreAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('exports the current secret key', async () => {
    const program = createProgram()
    saveIdentity(tmpDir, 'AGE-SECRET-KEY-1EXPORTEDKEY')

    await program.parseAsync(['node', 'dotcloak', 'key', 'export'])

    expect(vi.mocked(console.log)).toHaveBeenCalledWith('AGE-SECRET-KEY-1EXPORTEDKEY')
  })

  it('imports a secret key from a file', async () => {
    const program = createProgram()
    const keyFile = path.join(tmpDir, 'imported.age')
    fs.writeFileSync(keyFile, 'AGE-SECRET-KEY-1IMPORTEDKEY\n', 'utf-8')

    await program.parseAsync(['node', 'dotcloak', 'key', 'import', keyFile])

    expect(fs.readFileSync(path.join(tmpDir, '.dotcloak', 'key.age'), 'utf-8')).toBe(
      'AGE-SECRET-KEY-1IMPORTEDKEY',
    )
    expect(vi.mocked(console.log)).toHaveBeenCalledWith('Key imported successfully.')
  })

  it('shows a helpful error when exporting without a key', async () => {
    const program = createProgram()
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`)
    }) as never)

    await expect(program.parseAsync(['node', 'dotcloak', 'key', 'export'])).rejects.toThrow(
      'process.exit:1',
    )

    const stderr = vi.mocked(console.error).mock.calls.flat().join('\n')
    expect(stderr).toContain('What happened: Encryption key was not found.')
    expect(stderr).toContain(
      "How to fix: Run 'dotcloak init' or 'dotcloak key import <file>' first.",
    )

    exitSpy.mockRestore()
  })

  it('shows a helpful error when the import file does not exist', async () => {
    const program = createProgram()
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`)
    }) as never)

    await expect(
      program.parseAsync(['node', 'dotcloak', 'key', 'import', 'missing.age']),
    ).rejects.toThrow('process.exit:1')

    const stderr = vi.mocked(console.error).mock.calls.flat().join('\n')
    expect(stderr).toContain('What happened: Key file was not found: missing.age')
    expect(stderr).toContain('How to fix: Pass a valid path to an exported age secret key file.')

    exitSpy.mockRestore()
  })

  it('shows a helpful error when the import file is empty', async () => {
    const program = createProgram()
    const keyFile = path.join(tmpDir, 'empty.age')
    fs.writeFileSync(keyFile, '', 'utf-8')

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`)
    }) as never)

    await expect(
      program.parseAsync(['node', 'dotcloak', 'key', 'import', keyFile]),
    ).rejects.toThrow('process.exit:1')

    const stderr = vi.mocked(console.error).mock.calls.flat().join('\n')
    expect(stderr).toContain('What happened: Key file is empty.')
    expect(stderr).toContain('How to fix: Export the key again and retry the import.')

    exitSpy.mockRestore()
  })
})
