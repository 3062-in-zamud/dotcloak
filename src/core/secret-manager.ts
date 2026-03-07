import * as age from 'age-encryption'
import { decrypt, encrypt } from '../crypto/age-engine.js'
import { loadIdentity } from '../crypto/key-manager.js'
import { readCloakFile, writeCloakFile } from './cloak-file.js'
import { parse, stringify } from './env-parser.js'
import type { EnvMap } from './types.js'

export async function getSecrets(projectDir: string, cloakPath: string): Promise<EnvMap> {
  const identity = loadIdentity(projectDir)
  const armored = readCloakFile(cloakPath)
  const plaintext = await decrypt(armored, identity)
  return parse(plaintext)
}

export async function setSecret(
  projectDir: string,
  cloakPath: string,
  key: string,
  value: string,
): Promise<void> {
  const identity = loadIdentity(projectDir)
  const recipient = await age.identityToRecipient(identity)

  let secrets: EnvMap
  try {
    const armored = readCloakFile(cloakPath)
    const plaintext = await decrypt(armored, identity)
    secrets = parse(plaintext)
  } catch {
    secrets = new Map()
  }

  secrets.set(key, value)
  const plaintext = stringify(secrets)
  const armored = await encrypt(plaintext, recipient)
  writeCloakFile(cloakPath, armored)
}

export async function unsetSecret(
  projectDir: string,
  cloakPath: string,
  key: string,
): Promise<boolean> {
  const identity = loadIdentity(projectDir)
  const recipient = await age.identityToRecipient(identity)
  const armored = readCloakFile(cloakPath)
  const plaintext = await decrypt(armored, identity)
  const secrets = parse(plaintext)

  if (!secrets.has(key)) return false

  secrets.delete(key)
  const newPlaintext = stringify(secrets)
  const newArmored = await encrypt(newPlaintext, recipient)
  writeCloakFile(cloakPath, newArmored)
  return true
}

export function maskValue(value: string): string {
  if (value.length <= 4) return '****'
  return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2)
}
