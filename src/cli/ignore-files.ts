import * as fs from 'node:fs'
import * as path from 'node:path'

type IgnoreSpec = {
  fileName: string
  entries: string[]
}

const IGNORE_SPECS: IgnoreSpec[] = [
  {
    fileName: '.gitignore',
    entries: ['.dotcloak/key.age', '.env', '.env.*', '!.env.cloak'],
  },
  {
    fileName: '.claudeignore',
    entries: ['.dotcloak/key.age'],
  },
  {
    fileName: '.cursorignore',
    entries: ['.dotcloak/key.age'],
  },
]

export function updateIgnoreFiles(projectDir: string): string[] {
  const updatedFiles: string[] = []

  for (const spec of IGNORE_SPECS) {
    const filePath = path.join(projectDir, spec.fileName)
    const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : ''
    const existingLines = new Set(existing.split(/\r?\n/).filter((line) => line.length > 0))
    const missingEntries = spec.entries.filter((entry) => !existingLines.has(entry))

    if (missingEntries.length === 0) {
      continue
    }

    const prefix = existing.length > 0 && !existing.endsWith('\n') ? '\n' : ''
    const header = existingLines.has('# dotcloak') ? '' : '# dotcloak\n'
    const addition = `${prefix}${header}${missingEntries.join('\n')}\n`

    fs.appendFileSync(filePath, addition, 'utf-8')
    updatedFiles.push(spec.fileName)
  }

  return updatedFiles
}
