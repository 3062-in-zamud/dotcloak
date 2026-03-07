import * as age from 'age-encryption'
import { describe, expect, it } from 'vitest'
import { decrypt, encrypt } from '../../../src/crypto/age-engine.js'

describe('age-engine', () => {
  it('should encrypt and decrypt a string', async () => {
    const identity = await age.generateIdentity()
    const recipient = await age.identityToRecipient(identity)
    const plaintext = 'API_KEY=sk-test-12345\nDB_PASSWORD=secret'

    const encrypted = await encrypt(plaintext, recipient)
    expect(encrypted).toContain('-----BEGIN AGE ENCRYPTED FILE-----')

    const decrypted = await decrypt(encrypted, identity)
    expect(decrypted).toBe(plaintext)
  })

  it('should fail to decrypt with wrong identity', async () => {
    const identity1 = await age.generateIdentity()
    const recipient1 = await age.identityToRecipient(identity1)
    const identity2 = await age.generateIdentity()

    const encrypted = await encrypt('secret data', recipient1)
    await expect(decrypt(encrypted, identity2)).rejects.toThrow()
  })

  it('should handle empty string', async () => {
    const identity = await age.generateIdentity()
    const recipient = await age.identityToRecipient(identity)

    const encrypted = await encrypt('', recipient)
    const decrypted = await decrypt(encrypted, identity)
    expect(decrypted).toBe('')
  })
})
