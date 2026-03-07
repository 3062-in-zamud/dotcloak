import type { EnvMap } from './types.js'

export function parse(content: string): EnvMap {
  const env: EnvMap = new Map()
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) continue

    const withoutExport = trimmed.startsWith('export ') ? trimmed.slice(7) : trimmed

    const eqIndex = withoutExport.indexOf('=')
    if (eqIndex === -1) continue

    const key = withoutExport.slice(0, eqIndex).trim()
    let value = withoutExport.slice(eqIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env.set(key, value)
  }

  return env
}

export function stringify(env: EnvMap): string {
  const lines: string[] = []
  for (const [key, value] of env) {
    if (value.includes('\n') || value.includes(' ') || value.includes('"')) {
      lines.push(`${key}="${value.replace(/"/g, '\\"')}"`)
    } else {
      lines.push(`${key}=${value}`)
    }
  }
  return `${lines.join('\n')}\n`
}
