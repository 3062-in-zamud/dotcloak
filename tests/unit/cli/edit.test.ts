import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { Command } from 'commander'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { registerEditCommand } from '../../../src/cli/commands/edit.js'
import { writeCloakFile } from '../../../src/core/cloak-file.js'
import { stringify } from '../../../src/core/env-parser.js'
import { getSecrets } from '../../../src/core/secret-manager.js'
import { encrypt } from '../../../src/crypto/age-engine.js'
import { generateKeyPair, saveIdentity } from '../../../src/crypto/key-manager.js'

function createProgram(): Command {
  const program = new Command()
  registerEditCommand(program)
  return program
}

describe('edit command', () => {
  let originalCwd: string
  let originalEditor: string | undefined
  let tmpDir: string
  let cloakPath: string
  let recipient: string

  beforeEach(async () => {
    originalCwd = process.cwd()
    originalEditor = process.env.EDITOR
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-edit-test-'))
    cloakPath = path.join(tmpDir, '.env.cloak')
    process.chdir(tmpDir)

    const keyPair = await generateKeyPair()
    recipient = keyPair.recipient
    saveIdentity(tmpDir, keyPair.identity)

    const armored = await encrypt(stringify(new Map([['API_KEY', 'old-value']])), recipient)
    writeCloakFile(cloakPath, armored)

    vi.restoreAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.chdir(originalCwd)
    if (originalEditor === undefined) {
      process.env.EDITOR = undefined
    } else {
      process.env.EDITOR = originalEditor
    }
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('updates secrets using a non-interactive editor command', async () => {
    const program = createProgram()
    const editorScript = path.join(tmpDir, 'editor-success.mjs')
    fs.writeFileSync(
      editorScript,
      [
        "import * as fs from 'node:fs'",
        "fs.writeFileSync(process.argv[2], 'API_KEY=updated\\nNEW_KEY=from-editor\\n', 'utf-8')",
      ].join('\n'),
      'utf-8',
    )
    process.env.EDITOR = `${process.execPath} ${editorScript}`

    const tempFilesBefore = new Set(
      fs.readdirSync(os.tmpdir()).filter((fileName) => fileName.startsWith('dotcloak-edit-')),
    )

    await program.parseAsync(['node', 'dotcloak', 'edit'])

    const secrets = await getSecrets(tmpDir, cloakPath)
    expect(secrets.get('API_KEY')).toBe('updated')
    expect(secrets.get('NEW_KEY')).toBe('from-editor')
    expect(vi.mocked(console.log)).toHaveBeenCalledWith('Secrets updated.')

    const tempFilesAfter = new Set(
      fs.readdirSync(os.tmpdir()).filter((fileName) => fileName.startsWith('dotcloak-edit-')),
    )
    expect(tempFilesAfter).toEqual(tempFilesBefore)
  })

  it('surfaces an actionable error when the editor command fails', async () => {
    const program = createProgram()
    const editorScript = path.join(tmpDir, 'editor-fail.mjs')
    fs.writeFileSync(editorScript, 'process.exit(2)\n', 'utf-8')
    process.env.EDITOR = `${process.execPath} ${editorScript}`

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`)
    }) as never)

    await expect(program.parseAsync(['node', 'dotcloak', 'edit'])).rejects.toThrow('process.exit:1')

    const stderr = vi.mocked(console.error).mock.calls.flat().join('\n')
    expect(stderr).toContain('failed while editing secrets')
    expect(stderr).toContain('Set $EDITOR to a working editor and rerun the command.')

    exitSpy.mockRestore()
  })
})
