import * as fs from 'node:fs'
import * as path from 'node:path'
import type { Command } from 'commander'
import { cloakFileExists } from '../../core/cloak-file.js'

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show dotcloak status')
    .action(() => {
      const projectDir = process.cwd()
      const keyExists = fs.existsSync(path.join(projectDir, '.dotcloak', 'key.age'))
      const configExists = fs.existsSync(path.join(projectDir, '.dotcloak', 'config.toml'))
      const cloakExists = cloakFileExists(path.join(projectDir, '.env.cloak'))
      const envExists = fs.existsSync(path.join(projectDir, '.env'))

      console.log('dotcloak status:')
      console.log(`  Initialized: ${keyExists && configExists ? 'Yes' : 'No'}`)
      console.log(`  Key file: ${keyExists ? 'Found' : 'Missing'}`)
      console.log(`  Config: ${configExists ? 'Found' : 'Missing'}`)
      console.log(`  Encrypted .env: ${cloakExists ? 'Found' : 'Missing'}`)

      if (envExists) {
        console.log('')
        console.log('  WARNING: Unencrypted .env file detected!')
        console.log('  Run "dotcloak init" to encrypt it.')
      }
    })
}
