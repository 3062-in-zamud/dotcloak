import * as path from 'node:path'
import type { Command } from 'commander'
import { getSecrets, maskValue } from '../../core/secret-manager.js'

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List all secrets (masked values)')
    .option('-f, --file <path>', 'Path to .env.cloak file', '.env.cloak')
    .option('--show', 'Show actual values (use with caution)')
    .action(async (options: { file: string; show?: boolean }) => {
      const projectDir = process.cwd()
      const cloakPath = path.resolve(projectDir, options.file)

      const secrets = await getSecrets(projectDir, cloakPath)

      if (secrets.size === 0) {
        console.log('No secrets found.')
        return
      }

      for (const [key, value] of secrets) {
        const displayValue = options.show ? value : maskValue(value)
        console.log(`${key}=${displayValue}`)
      }
    })
}
