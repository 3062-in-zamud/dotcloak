import * as fs from 'node:fs'
import * as path from 'node:path'
import * as age from 'age-encryption'
import type { KeyPair } from '../core/types.js'

const DOTCLOAK_DIR = '.dotcloak'
const KEY_FILE = 'key.age'

export async function generateKeyPair(): Promise<KeyPair> {
  const identity = await age.generateIdentity()
  const recipient = await age.identityToRecipient(identity)
  return { identity, recipient }
}

export function saveIdentity(projectDir: string, identity: string): void {
  const dir = path.join(projectDir, DOTCLOAK_DIR)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const keyPath = path.join(dir, KEY_FILE)
  fs.writeFileSync(keyPath, identity, { mode: 0o600 })
}

export function loadIdentity(projectDir: string): string {
  const keyPath = path.join(projectDir, DOTCLOAK_DIR, KEY_FILE)
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Key file not found: ${keyPath}\nRun 'dotcloak init' first.`)
  }
  return fs.readFileSync(keyPath, 'utf-8').trim()
}
