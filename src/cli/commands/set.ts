import * as path from 'node:path'
import type { Command } from 'commander'
import { setSecret } from '../../core/secret-manager.js'

export function registerSetCommand(program: Command): void {
  program
    .command('set')
    .description('Set a secret (KEY=VALUE)')
    .argument('<keyvalue>', 'Key=Value pair')
    .option('-f, --file <path>', 'Path to .env.cloak file', '.env.cloak')
    .action(async (keyvalue: string, options: { file: string }) => {
      const projectDir = process.cwd()
      const cloakPath = path.resolve(projectDir, options.file)

      const eqIndex = keyvalue.indexOf('=')
      if (eqIndex === -1) {
        console.error('Error: Use KEY=VALUE format')
        process.exit(1)
      }

      const key = keyvalue.slice(0, eqIndex)
      const value = keyvalue.slice(eqIndex + 1)

      await setSecret(projectDir, cloakPath, key, value)
      console.log(`Set ${key}`)
    })
}
