import { spawn } from 'node:child_process'
import type { EnvMap } from '../core/types.js'

export function runWithSecrets(command: string, args: string[], secrets: EnvMap): Promise<number> {
  const envVars: Record<string, string> = {}
  for (const [key, value] of secrets) {
    envVars[key] = value
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...envVars },
      stdio: 'inherit',
    })

    child.on('error', (err) => {
      reject(new Error(`Failed to start process: ${err.message}`))
    })

    child.on('exit', (code) => {
      resolve(code ?? 1)
    })
  })
}
