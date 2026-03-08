import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { writeCloakFile } from '../../../src/core/cloak-file.js'
import { stringify } from '../../../src/core/env-parser.js'
import { getSecrets, maskValue, setSecret, unsetSecret } from '../../../src/core/secret-manager.js'
import type { EnvMap } from '../../../src/core/types.js'
import { encrypt } from '../../../src/crypto/age-engine.js'
import { generateKeyPair, saveIdentity } from '../../../src/crypto/key-manager.js'

describe('secret-manager', () => {
  let tmpDir: string
  let cloakPath: string
  let recipient: string

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-secret-manager-test-'))
    cloakPath = path.join(tmpDir, '.env.cloak')

    const keyPair = await generateKeyPair()
    recipient = keyPair.recipient
    saveIdentity(tmpDir, keyPair.identity)
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  async function writeSecrets(entries: [string, string][]): Promise<void> {
    const plaintext = stringify(new Map(entries))
    const armored = await encrypt(plaintext, recipient)
    writeCloakFile(cloakPath, armored)
  }

  async function readSecrets(): Promise<EnvMap> {
    return await getSecrets(tmpDir, cloakPath)
  }

  it('reads secrets from an existing .env.cloak file', async () => {
    await writeSecrets([
      ['API_KEY', 'super-secret'],
      ['DB_HOST', 'localhost'],
    ])

    const secrets = await getSecrets(tmpDir, cloakPath)

    expect(secrets.get('API_KEY')).toBe('super-secret')
    expect(secrets.get('DB_HOST')).toBe('localhost')
  })

  it('updates an existing .env.cloak file when setting a secret', async () => {
    await writeSecrets([['EXISTING', 'value']])

    await setSecret(tmpDir, cloakPath, 'NEW_KEY', 'new-value')

    const secrets = await readSecrets()
    expect(secrets.get('EXISTING')).toBe('value')
    expect(secrets.get('NEW_KEY')).toBe('new-value')
  })

  it('creates a new .env.cloak file when the file is missing', async () => {
    await setSecret(tmpDir, cloakPath, 'API_KEY', 'created-from-missing-file')

    expect(fs.existsSync(cloakPath)).toBe(true)

    const secrets = await readSecrets()
    expect(secrets.size).toBe(1)
    expect(secrets.get('API_KEY')).toBe('created-from-missing-file')
  })

  it('falls back to a new .env.cloak file when the existing file is corrupted', async () => {
    fs.writeFileSync(cloakPath, 'this is not valid age ciphertext', 'utf-8')

    await setSecret(tmpDir, cloakPath, 'API_KEY', 'recreated')

    const secrets = await readSecrets()
    expect(secrets.size).toBe(1)
    expect(secrets.get('API_KEY')).toBe('recreated')
  })

  it('removes an existing secret', async () => {
    await writeSecrets([
      ['API_KEY', 'secret'],
      ['DB_HOST', 'localhost'],
    ])

    await expect(unsetSecret(tmpDir, cloakPath, 'API_KEY')).resolves.toBe(true)

    const secrets = await readSecrets()
    expect(secrets.has('API_KEY')).toBe(false)
    expect(secrets.get('DB_HOST')).toBe('localhost')
  })

  it('returns false and leaves the file untouched when the key does not exist', async () => {
    await writeSecrets([['API_KEY', 'secret']])
    const before = fs.readFileSync(cloakPath, 'utf-8')

    await expect(unsetSecret(tmpDir, cloakPath, 'MISSING_KEY')).resolves.toBe(false)

    expect(fs.readFileSync(cloakPath, 'utf-8')).toBe(before)
  })

  it('masks short values and long values', () => {
    expect(maskValue('abcd')).toBe('****')
    expect(maskValue('super-secret')).toBe('su********et')
  })
})
