import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { updateIgnoreFiles } from '../../../src/cli/ignore-files.js'

describe('updateIgnoreFiles', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-ignore-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('creates git, Claude, and Cursor ignore entries', () => {
    fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules\n', 'utf-8')

    const updated = updateIgnoreFiles(tmpDir)

    expect(updated.sort()).toEqual(['.claudeignore', '.cursorignore', '.gitignore'])
    expect(fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8')).toContain('.dotcloak/key.age')
    expect(fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8')).toContain('node_modules')
    expect(fs.readFileSync(path.join(tmpDir, '.claudeignore'), 'utf-8')).toContain(
      '.dotcloak/key.age',
    )
    expect(fs.readFileSync(path.join(tmpDir, '.cursorignore'), 'utf-8')).toContain(
      '.dotcloak/key.age',
    )
  })

  it('is idempotent when run repeatedly', () => {
    updateIgnoreFiles(tmpDir)
    const initialGitignore = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8')
    const initialClaudeignore = fs.readFileSync(path.join(tmpDir, '.claudeignore'), 'utf-8')
    const initialCursorignore = fs.readFileSync(path.join(tmpDir, '.cursorignore'), 'utf-8')

    const updated = updateIgnoreFiles(tmpDir)

    expect(updated).toEqual([])
    expect(fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8')).toBe(initialGitignore)
    expect(fs.readFileSync(path.join(tmpDir, '.claudeignore'), 'utf-8')).toBe(initialClaudeignore)
    expect(fs.readFileSync(path.join(tmpDir, '.cursorignore'), 'utf-8')).toBe(initialCursorignore)
  })
})
