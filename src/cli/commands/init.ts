import * as fs from 'node:fs'
import * as path from 'node:path'
import type { Command } from 'commander'
import { createDefaultConfig } from '../../config/defaults.js'
import { saveConfig } from '../../config/loader.js'
import { writeCloakFile } from '../../core/cloak-file.js'
import { encrypt } from '../../crypto/age-engine.js'
import { generateKeyPair, saveIdentity } from '../../crypto/key-manager.js'
import { fail, withCliErrorHandling } from '../errors.js'
import { updateIgnoreFiles } from '../ignore-files.js'

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize dotcloak: generate keys and encrypt .env')
    .option('-f, --file <path>', 'Path to .env file', '.env')
    .option('--keep', 'Keep the original .env file')
    .action(
      withCliErrorHandling(async (options: { file: string; keep?: boolean }) => {
        const projectDir = process.cwd()
        const envPath = path.resolve(projectDir, options.file)
        const cloakPath = `${envPath}.cloak`

        if (!fs.existsSync(envPath)) {
          fail(
            `${options.file} was not found.`,
            `Create ${options.file} or pass '--file <path>' to the correct env file.`,
          )
        }

        console.log('Generating encryption keys...')
        const keyPair = await generateKeyPair()
        saveIdentity(projectDir, keyPair.identity)

        console.log('Encrypting .env...')
        const plaintext = fs.readFileSync(envPath, 'utf-8')
        const armored = await encrypt(plaintext, keyPair.recipient)
        writeCloakFile(cloakPath, armored)

        const config = createDefaultConfig(keyPair.recipient)
        saveConfig(projectDir, config)

        const updatedIgnoreFiles = updateIgnoreFiles(projectDir)
        for (const fileName of updatedIgnoreFiles) {
          console.log(`Updated ${fileName}`)
        }

        if (!options.keep) {
          fs.unlinkSync(envPath)
          console.log(`Deleted ${options.file}`)
        }

        console.log('Done! Your secrets are now encrypted.')
        console.log(`  Encrypted file: ${path.relative(projectDir, cloakPath)}`)
        console.log('  Key file: .dotcloak/key.age')
        console.log('')
        console.log('Run your app with:')
        console.log('  dotcloak run <command>')
      }, "Check the env file path and try 'dotcloak init' again."),
    )
}
