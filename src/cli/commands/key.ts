import * as fs from 'node:fs'
import * as path from 'node:path'
import type { Command } from 'commander'
import { loadIdentity, saveIdentity } from '../../crypto/key-manager.js'
import { fail, withCliErrorHandling } from '../errors.js'

export function registerKeyCommand(program: Command): void {
  const keyCmd = program.command('key').description('Manage encryption keys')

  keyCmd
    .command('export')
    .description('Export the secret key')
    .action(
      withCliErrorHandling(() => {
        const projectDir = process.cwd()
        const identity = loadIdentity(projectDir)
        console.log(identity)
      }, "Run 'dotcloak init' or 'dotcloak key import <file>' before exporting a key."),
    )

  keyCmd
    .command('import')
    .description('Import a secret key')
    .argument('<keyfile>', 'Path to key file')
    .action(
      withCliErrorHandling((keyfile: string) => {
        const projectDir = process.cwd()
        const keyPath = path.resolve(keyfile)

        if (!fs.existsSync(keyPath)) {
          fail(
            `Key file was not found: ${keyfile}`,
            'Pass a valid path to an exported age secret key file.',
          )
        }

        const identity = fs.readFileSync(keyPath, 'utf-8').trim()
        if (identity.length === 0) {
          fail('Key file is empty.', 'Export the key again and retry the import.')
        }

        saveIdentity(projectDir, identity)
        console.log('Key imported successfully.')
      }, 'Verify the key file path and content, then retry the import.'),
    )
}
