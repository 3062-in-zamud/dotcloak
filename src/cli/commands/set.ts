import * as path from 'node:path'
import type { Command } from 'commander'
import { setSecret } from '../../core/secret-manager.js'
import { fail, withCliErrorHandling } from '../errors.js'
import { promptHiddenValue } from '../prompt-secret.js'

export function registerSetCommand(program: Command): void {
  program
    .command('set')
    .description('Set a secret (KEY=VALUE or hidden prompt)')
    .argument('<key-or-key=value>', 'Key name or Key=Value pair')
    .option('-f, --file <path>', 'Path to .env.cloak file', '.env.cloak')
    .action(
      withCliErrorHandling(async (keyOrKeyValue: string, options: { file: string }) => {
        const projectDir = process.cwd()
        const cloakPath = path.resolve(projectDir, options.file)

        const eqIndex = keyOrKeyValue.indexOf('=')
        const hasInlineValue = eqIndex !== -1
        const key = hasInlineValue ? keyOrKeyValue.slice(0, eqIndex) : keyOrKeyValue

        if (key.trim().length === 0) {
          fail(
            'Secret key is empty.',
            "Use 'dotcloak set KEY=VALUE' or 'dotcloak set KEY' with a non-empty key.",
          )
        }

        const value = hasInlineValue
          ? keyOrKeyValue.slice(eqIndex + 1)
          : await promptHiddenValue(`Enter value for ${key}: `)

        await setSecret(projectDir, cloakPath, key, value)
        console.log(`Set ${key}`)
      }, "Use 'dotcloak set KEY=VALUE' or 'dotcloak set KEY' and try again."),
    )
}
