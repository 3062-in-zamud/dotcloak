import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as age from 'age-encryption'
import type { Command } from 'commander'
import { writeCloakFile } from '../../core/cloak-file.js'
import { parse, stringify } from '../../core/env-parser.js'
import { getSecrets } from '../../core/secret-manager.js'
import { encrypt } from '../../crypto/age-engine.js'
import { loadIdentity } from '../../crypto/key-manager.js'

export function registerEditCommand(program: Command): void {
  program
    .command('edit')
    .description('Edit secrets in your $EDITOR')
    .option('-f, --file <path>', 'Path to .env.cloak file', '.env.cloak')
    .action(async (options: { file: string }) => {
      const editor = process.env.EDITOR || process.env.VISUAL || 'vi'
      const projectDir = process.cwd()
      const cloakPath = path.resolve(projectDir, options.file)

      const secrets = await getSecrets(projectDir, cloakPath)
      const plaintext = stringify(secrets)

      const tmpFile = path.join(os.tmpdir(), `dotcloak-edit-${Date.now()}.env`)
      fs.writeFileSync(tmpFile, plaintext, { mode: 0o600 })

      try {
        execSync(`${editor} "${tmpFile}"`, { stdio: 'inherit' })
        const edited = fs.readFileSync(tmpFile, 'utf-8')
        const newSecrets = parse(edited)

        const identity = loadIdentity(projectDir)
        const recipient = await age.identityToRecipient(identity)
        const newPlaintext = stringify(newSecrets)
        const armored = await encrypt(newPlaintext, recipient)
        writeCloakFile(cloakPath, armored)

        console.log('Secrets updated.')
      } finally {
        if (fs.existsSync(tmpFile)) {
          fs.unlinkSync(tmpFile)
        }
      }
    })
}
