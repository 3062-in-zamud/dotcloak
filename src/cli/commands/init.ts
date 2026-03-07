import * as fs from 'node:fs'
import * as path from 'node:path'
import type { Command } from 'commander'
import { createDefaultConfig } from '../../config/defaults.js'
import { saveConfig } from '../../config/loader.js'
import { writeCloakFile } from '../../core/cloak-file.js'
import { encrypt } from '../../crypto/age-engine.js'
import { generateKeyPair, saveIdentity } from '../../crypto/key-manager.js'

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize dotcloak: generate keys and encrypt .env')
    .option('-f, --file <path>', 'Path to .env file', '.env')
    .option('--keep', 'Keep the original .env file')
    .action(async (options: { file: string; keep?: boolean }) => {
      const projectDir = process.cwd()
      const envPath = path.resolve(projectDir, options.file)
      const cloakPath = `${envPath}.cloak`

      if (!fs.existsSync(envPath)) {
        console.error(`Error: ${options.file} not found`)
        process.exit(1)
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

      updateGitignore(projectDir)

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
    })
}

function updateGitignore(projectDir: string): void {
  const gitignorePath = path.join(projectDir, '.gitignore')
  const entries = ['.dotcloak/key.age', '.env', '.env.*', '!.env.cloak']
  let content = ''

  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf-8')
  }

  const linesToAdd: string[] = []
  for (const entry of entries) {
    if (!content.includes(entry)) {
      linesToAdd.push(entry)
    }
  }

  if (linesToAdd.length > 0) {
    const addition = `\n# dotcloak\n${linesToAdd.join('\n')}\n`
    fs.appendFileSync(gitignorePath, addition)
    console.log('Updated .gitignore')
  }
}
