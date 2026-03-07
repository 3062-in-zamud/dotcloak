import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readCloakFile, writeCloakFile } from '../../src/core/cloak-file.js'
import { parse } from '../../src/core/env-parser.js'
import { decrypt, encrypt } from '../../src/crypto/age-engine.js'
import { generateKeyPair, saveIdentity } from '../../src/crypto/key-manager.js'

describe('encrypt-decrypt integration', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-integ-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should encrypt .env content and decrypt back to original', async () => {
    const envContent = 'API_KEY=sk-test-12345\nDB_PASSWORD=supersecret\nPORT=3000'
    const keyPair = await generateKeyPair()
    saveIdentity(tmpDir, keyPair.identity)

    const armored = await encrypt(envContent, keyPair.recipient)
    const cloakPath = path.join(tmpDir, '.env.cloak')
    writeCloakFile(cloakPath, armored)

    const loaded = readCloakFile(cloakPath)
    expect(loaded).toContain('-----BEGIN AGE ENCRYPTED FILE-----')
    expect(loaded).not.toContain('sk-test-12345')

    const decrypted = await decrypt(loaded, keyPair.identity)
    const parsed = parse(decrypted)
    expect(parsed.get('API_KEY')).toBe('sk-test-12345')
    expect(parsed.get('DB_PASSWORD')).toBe('supersecret')
    expect(parsed.get('PORT')).toBe('3000')
  })
})
