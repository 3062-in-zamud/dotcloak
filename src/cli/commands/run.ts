import * as path from 'node:path'
import type { Command } from 'commander'
import { getSecrets } from '../../core/secret-manager.js'
import { runWithSecrets } from '../../runner/child-process.js'
import { withCliErrorHandling } from '../errors.js'

export function registerRunCommand(program: Command): void {
  program
    .command('run')
    .description('Run a command with decrypted secrets injected as environment variables')
    .option('-f, --file <path>', 'Path to .env.cloak file', '.env.cloak')
    .argument('<command...>', 'Command to run')
    .action(
      withCliErrorHandling(async (commandArgs: string[], options: { file: string }) => {
        const projectDir = process.cwd()
        const cloakPath = path.resolve(projectDir, options.file)

        const secrets = await getSecrets(projectDir, cloakPath)
        const [cmd, ...args] = commandArgs
        const exitCode = await runWithSecrets(cmd, args, secrets)
        process.exit(exitCode)
      }, "Run 'dotcloak init' first and verify the target command exists."),
    )
}
