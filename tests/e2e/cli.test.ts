import { type SpawnSyncOptionsWithStringEncoding, spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('CLI e2e', () => {
  let tmpDir: string
  const cliPath = path.resolve('src/cli/index.ts')
  const tsxLoaderPath = path.resolve('node_modules/tsx/dist/loader.mjs')
  const cliBootstrapArgs = ['--import', tsxLoaderPath, cliPath]

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-e2e-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  function runCli(
    args: string[],
    options: Omit<SpawnSyncOptionsWithStringEncoding, 'encoding'> = {},
  ) {
    const result = spawnSync(process.execPath, [...cliBootstrapArgs, ...args], {
      cwd: tmpDir,
      encoding: 'utf-8',
      env: { ...process.env, ...options.env },
      ...options,
    })

    if (result.error) {
      throw result.error
    }

    return result
  }

  function bootstrapProject(envContent = 'API_KEY=super-secret\nSECOND=value\n') {
    fs.writeFileSync(path.join(tmpDir, '.env'), envContent, 'utf-8')
    const result = runCli(['init', '--keep'])
    expect(result.status).toBe(0)
  }

  it('should show help', () => {
    const result = runCli(['--help'])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('dotcloak')
    expect(result.stdout).toContain('init')
    expect(result.stdout).toContain('run')
  })

  it('should show version', () => {
    const result = runCli(['--version'])

    expect(result.status).toBe(0)
    expect(result.stdout.trim()).toBe('0.1.0')
  })

  it('initializes a project and creates encrypted artifacts', () => {
    fs.writeFileSync(path.join(tmpDir, '.env'), 'API_KEY=super-secret\n', 'utf-8')

    const result = runCli(['init', '--keep'])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('Done! Your secrets are now encrypted.')
    expect(fs.existsSync(path.join(tmpDir, '.env'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, '.env.cloak'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, '.dotcloak', 'key.age'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, '.dotcloak', 'config.toml'))).toBe(true)
    expect(fs.readFileSync(path.join(tmpDir, '.claudeignore'), 'utf-8')).toContain(
      '.dotcloak/key.age',
    )
    expect(fs.readFileSync(path.join(tmpDir, '.cursorignore'), 'utf-8')).toContain(
      '.dotcloak/key.age',
    )
  })

  it('runs a command with decrypted secrets injected into the environment', () => {
    bootstrapProject()

    const result = runCli([
      'run',
      '--',
      process.execPath,
      '-e',
      'process.stdout.write(`${process.env.API_KEY}|${process.env.SECOND}`)',
    ])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('super-secret|value')
  })

  it('sets a secret via KEY=VALUE and persists it', () => {
    bootstrapProject()

    const setResult = runCli(['set', 'API_KEY=updated-value'])
    const listResult = runCli(['list', '--show'])

    expect(setResult.status).toBe(0)
    expect(setResult.stdout).toContain('Set API_KEY')
    expect(listResult.stdout).toContain('API_KEY=updated-value')
  })

  it('unsets a secret and removes it from the encrypted store', () => {
    bootstrapProject()

    const unsetResult = runCli(['unset', 'API_KEY'])
    const listResult = runCli(['list', '--show'])

    expect(unsetResult.status).toBe(0)
    expect(unsetResult.stdout).toContain('Removed API_KEY')
    expect(listResult.stdout).not.toContain('API_KEY=')
    expect(listResult.stdout).toContain('SECOND=value')
  })

  it('lists secrets with masked values by default', () => {
    bootstrapProject('API_KEY=super-secret\nPIN=1234\n')

    const result = runCli(['list'])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('API_KEY=su********et')
    expect(result.stdout).toContain('PIN=****')
  })

  it('edits secrets through a safe non-interactive editor command', () => {
    bootstrapProject()

    const editorScript = path.join(tmpDir, 'editor.mjs')
    fs.writeFileSync(
      editorScript,
      [
        "import * as fs from 'node:fs'",
        "fs.writeFileSync(process.argv[2], 'API_KEY=edited-value\\nSECOND=value\\nADDED=from-editor\\n', 'utf-8')",
      ].join('\n'),
      'utf-8',
    )

    const editResult = runCli(['edit'], {
      env: { EDITOR: `${process.execPath} ${editorScript}` },
    })
    const listResult = runCli(['list', '--show'])

    expect(editResult.status).toBe(0)
    expect(editResult.stdout).toContain('Secrets updated.')
    expect(listResult.stdout).toContain('API_KEY=edited-value')
    expect(listResult.stdout).toContain('ADDED=from-editor')
  })

  it('shows project status after initialization', () => {
    bootstrapProject()

    const result = runCli(['status'])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('Initialized: Yes')
    expect(result.stdout).toContain('Key file: Found')
    expect(result.stdout).toContain('Encrypted .env: Found')
    expect(result.stdout).toContain('WARNING: Unencrypted .env file detected!')
  })

  it('exports and imports a secret key across projects', () => {
    bootstrapProject()

    const exportResult = runCli(['key', 'export'])
    expect(exportResult.status).toBe(0)
    expect(exportResult.stdout.trim()).toMatch(/^AGE-SECRET-KEY-1/)

    const otherDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotcloak-e2e-import-'))
    try {
      const keyFile = path.join(otherDir, 'imported.age')
      fs.writeFileSync(keyFile, exportResult.stdout, 'utf-8')

      const importResult = spawnSync(
        process.execPath,
        [...cliBootstrapArgs, 'key', 'import', keyFile],
        {
          cwd: otherDir,
          encoding: 'utf-8',
          env: process.env,
        },
      )

      if (importResult.error) {
        throw importResult.error
      }

      expect(importResult.status).toBe(0)
      expect(importResult.stdout).toContain('Key imported successfully.')
      expect(fs.readFileSync(path.join(otherDir, '.dotcloak', 'key.age'), 'utf-8')).toMatch(
        /^AGE-SECRET-KEY-1/,
      )
    } finally {
      fs.rmSync(otherDir, { recursive: true, force: true })
    }
  })
})
