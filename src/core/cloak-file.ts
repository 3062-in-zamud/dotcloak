import * as fs from 'node:fs'

export function readCloakFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Cloak file not found: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf-8')
}

export function writeCloakFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8')
}

export function cloakFileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}
