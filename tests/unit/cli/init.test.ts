import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { Command } from 'commander'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { registerInitCommand } from '../../../src/cli/commands/init.js'

function createProgram(): Command {
  const program = new Command()
  registerInitCommand(program)
  return program
}

describe('init command', () => {
  let originalCwd: string
  let tmpDir: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-init-test-'))
    process.chdir(tmpDir)
    vi.restoreAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('creates ignore files while encrypting the env file', async () => {
    fs.writeFileSync('.env', 'API_KEY=test\n', 'utf-8')
    fs.writeFileSync('.gitignore', 'node_modules\n', 'utf-8')
    const program = createProgram()

    await program.parseAsync(['node', 'dotcloak', 'init', '--keep'])

    expect(fs.existsSync('.dotcloak/key.age')).toBe(true)
    expect(fs.existsSync('.dotcloak/config.toml')).toBe(true)
    expect(fs.readFileSync('.env.cloak', 'utf-8')).toContain('-----BEGIN AGE ENCRYPTED FILE-----')
    expect(fs.readFileSync('.gitignore', 'utf-8')).toContain('.dotcloak/key.age')
    expect(fs.readFileSync('.gitignore', 'utf-8')).toContain('node_modules')
    expect(fs.readFileSync('.claudeignore', 'utf-8')).toContain('.dotcloak/key.age')
    expect(fs.readFileSync('.cursorignore', 'utf-8')).toContain('.dotcloak/key.age')
  })

  it('does not duplicate ignore entries on repeated init runs', async () => {
    fs.writeFileSync('.env', 'API_KEY=test\n', 'utf-8')
    const program = createProgram()

    await program.parseAsync(['node', 'dotcloak', 'init', '--keep'])
    const firstGitignore = fs.readFileSync('.gitignore', 'utf-8')
    const firstClaudeignore = fs.readFileSync('.claudeignore', 'utf-8')
    const firstCursorignore = fs.readFileSync('.cursorignore', 'utf-8')

    await program.parseAsync(['node', 'dotcloak', 'init', '--keep'])

    expect(fs.readFileSync('.gitignore', 'utf-8')).toBe(firstGitignore)
    expect(fs.readFileSync('.claudeignore', 'utf-8')).toBe(firstClaudeignore)
    expect(fs.readFileSync('.cursorignore', 'utf-8')).toBe(firstCursorignore)
  })
})
