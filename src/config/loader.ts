import * as fs from 'node:fs'
import * as path from 'node:path'
import * as TOML from 'smol-toml'
import { DotcloakConfigSchema } from './types.js'
import type { DotcloakConfig } from './types.js'

const CONFIG_FILE = 'config.toml'
const DOTCLOAK_DIR = '.dotcloak'

export function loadConfig(projectDir: string): DotcloakConfig {
  const configPath = path.join(projectDir, DOTCLOAK_DIR, CONFIG_FILE)
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}\nRun 'dotcloak init' first.`)
  }
  const content = fs.readFileSync(configPath, 'utf-8')
  const parsed = TOML.parse(content)
  return DotcloakConfigSchema.parse(parsed)
}

export function saveConfig(projectDir: string, config: DotcloakConfig): void {
  const dir = path.join(projectDir, DOTCLOAK_DIR)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const configPath = path.join(dir, CONFIG_FILE)
  const content = TOML.stringify(config as Record<string, unknown>)
  fs.writeFileSync(configPath, content, 'utf-8')
}
