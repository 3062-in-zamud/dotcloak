import { z } from 'zod'

export const DotcloakConfigSchema = z.object({
  dotcloak: z.object({
    version: z.string().default('1'),
  }),
  encryption: z.object({
    recipient: z.string(),
  }),
  files: z.object({
    sources: z.array(z.string()).default(['.env']),
  }),
  options: z.object({
    delete_original: z.boolean().default(true),
    backup: z.boolean().default(true),
  }),
})

export type DotcloakConfig = z.infer<typeof DotcloakConfigSchema>
