export type EnvMap = Map<string, string>

export interface DotcloakConfig {
  dotcloak: {
    version: string
  }
  encryption: {
    recipient: string
  }
  files: {
    sources: string[]
  }
  options: {
    delete_original: boolean
    backup: boolean
  }
}

export interface KeyPair {
  identity: string
  recipient: string
}
