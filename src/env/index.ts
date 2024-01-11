import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test', override: true })
} else {
  config()
}

const envSchema = z.object({
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid envoriment variables!', _env.error.format())

  throw new Error('Invalid envoriment variables!')
}

export const env = _env.data
