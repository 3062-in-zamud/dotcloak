import * as fs from 'node:fs'
import * as path from 'node:path'
import type { Command } from 'commander'
import { loadIdentity, saveIdentity } from '../../crypto/key-manager.js'

export function registerKeyCommand(program: Command): void {
  const keyCmd = program.command('key').description('Manage encryption keys')

  keyCmd
    .command('export')
    .description('Export the secret key')
    .action(() => {
      const projectDir = process.cwd()
      const identity = loadIdentity(projectDir)
      console.log(identity)
    })

  keyCmd
    .command('import')
    .description('Import a secret key')
    .argument('<keyfile>', 'Path to key file')
    .action((keyfile: string) => {
      const projectDir = process.cwd()
      const keyPath = path.resolve(keyfile)

      if (!fs.existsSync(keyPath)) {
        console.error(`Error: Key file not found: ${keyfile}`)
        process.exit(1)
      }

      const identity = fs.readFileSync(keyPath, 'utf-8').trim()
      saveIdentity(projectDir, identity)
      console.log('Key imported successfully.')
    })
}
