import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cloakFileExists, readCloakFile, writeCloakFile } from '../../../src/core/cloak-file.js'

describe('cloak-file', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-cloak-file-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('reads an existing cloak file', () => {
    const filePath = path.join(tmpDir, '.env.cloak')
    fs.writeFileSync(filePath, 'encrypted-content', 'utf-8')

    expect(readCloakFile(filePath)).toBe('encrypted-content')
  })

  it('throws when the cloak file is missing', () => {
    const filePath = path.join(tmpDir, '.env.cloak')

    expect(() => readCloakFile(filePath)).toThrow(`Cloak file not found: ${filePath}`)
  })

  it('writes a cloak file', () => {
    const filePath = path.join(tmpDir, '.env.cloak')

    writeCloakFile(filePath, 'new-encrypted-content')

    expect(fs.readFileSync(filePath, 'utf-8')).toBe('new-encrypted-content')
  })

  it('reports whether a cloak file exists', () => {
    const filePath = path.join(tmpDir, '.env.cloak')

    expect(cloakFileExists(filePath)).toBe(false)

    fs.writeFileSync(filePath, 'encrypted-content', 'utf-8')

    expect(cloakFileExists(filePath)).toBe(true)
  })
})
