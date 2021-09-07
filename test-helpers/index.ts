import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/core/build/standalone'
import { join } from 'path'

export const fs = new Filesystem(join(__dirname, 'tmp'))

/**
 * Setup application
 */
export async function setupApplication(
  mongoConfig?: any,
  additionalProviders?: string[],
  environment: 'web' | 'repl' | 'test' = 'test'
) {
  await fs.add('.env', '')
  await fs.add(
    'config/app.ts',
    `
    export const appKey = 'averylong32charsrandomsecretkey',
    export const http = {
      cookie: {},
      trustProxy: () => true,
    }
  `
  )

  await fs.add(
    'config/mongoose.ts',
    `
    const mongoconfig = ${JSON.stringify(mongoConfig, null, 2)}
    export default mongoconfig
  `
  )

  const app = new Application(fs.basePath, environment, {
    aliases: {
      App: './app',
    },
    providers: ['@adonisjs/core', '@adonisjs/repl'].concat(additionalProviders || []),
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  return app
}
