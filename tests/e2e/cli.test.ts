import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('CLI e2e', () => {
  let tmpDir: string
  const cliPath = path.resolve('dist/cli/index.js')

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-e2e-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should show help', () => {
    const result = execSync(`node ${cliPath} --help`, { encoding: 'utf-8' })
    expect(result).toContain('dotcloak')
    expect(result).toContain('init')
    expect(result).toContain('run')
  })

  it('should show version', () => {
    const result = execSync(`node ${cliPath} --version`, { encoding: 'utf-8' })
    expect(result.trim()).toBe('0.1.0')
  })
})
