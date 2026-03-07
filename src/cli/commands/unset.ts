import * as path from 'node:path'
import type { Command } from 'commander'
import { unsetSecret } from '../../core/secret-manager.js'

export function registerUnsetCommand(program: Command): void {
  program
    .command('unset')
    .description('Remove a secret')
    .argument('<key>', 'Key to remove')
    .option('-f, --file <path>', 'Path to .env.cloak file', '.env.cloak')
    .action(async (key: string, options: { file: string }) => {
      const projectDir = process.cwd()
      const cloakPath = path.resolve(projectDir, options.file)

      const removed = await unsetSecret(projectDir, cloakPath, key)
      if (removed) {
        console.log(`Removed ${key}`)
      } else {
        console.error(`Key not found: ${key}`)
        process.exit(1)
      }
    })
}
