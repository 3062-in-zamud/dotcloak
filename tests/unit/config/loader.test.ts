import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDefaultConfig } from '../../../src/config/defaults.js'
import { loadConfig, saveConfig } from '../../../src/config/loader.js'

describe('config loader', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-config-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should save and load config', () => {
    const config = createDefaultConfig('age1testrecipient123')
    saveConfig(tmpDir, config)

    const loaded = loadConfig(tmpDir)
    expect(loaded.encryption.recipient).toBe('age1testrecipient123')
    expect(loaded.dotcloak.version).toBe('1')
    expect(loaded.files.sources).toEqual(['.env'])
    expect(loaded.options.delete_original).toBe(true)
  })

  it('should throw if config does not exist', () => {
    expect(() => loadConfig(tmpDir)).toThrow('Config not found')
  })
})
