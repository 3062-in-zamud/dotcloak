import type { DotcloakConfig } from './types.js'

export function createDefaultConfig(recipient: string): DotcloakConfig {
  return {
    dotcloak: { version: '1' },
    encryption: { recipient },
    files: { sources: ['.env'] },
    options: { delete_original: true, backup: true },
  }
}
