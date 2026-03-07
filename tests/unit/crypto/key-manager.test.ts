import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateKeyPair, loadIdentity, saveIdentity } from '../../../src/crypto/key-manager.js'

describe('key-manager', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should generate a valid key pair', async () => {
    const keyPair = await generateKeyPair()
    expect(keyPair.identity).toMatch(/^AGE-SECRET-KEY-1/)
    expect(keyPair.recipient).toMatch(/^age1/)
  })

  it('should save and load identity', async () => {
    const keyPair = await generateKeyPair()
    saveIdentity(tmpDir, keyPair.identity)

    const loaded = loadIdentity(tmpDir)
    expect(loaded).toBe(keyPair.identity)
  })

  it('should throw if key file does not exist', () => {
    expect(() => loadIdentity(tmpDir)).toThrow('Key file not found')
  })

  it('should set file permissions to 0600', async () => {
    const keyPair = await generateKeyPair()
    saveIdentity(tmpDir, keyPair.identity)

    const keyPath = path.join(tmpDir, '.dotcloak', 'key.age')
    const stats = fs.statSync(keyPath)
    const permissions = (stats.mode & 0o777).toString(8)
    expect(permissions).toBe('600')
  })
})
