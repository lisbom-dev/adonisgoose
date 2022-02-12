import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import mongoose from 'mongoose'
import { getAdonisGooseAuthProvider } from '../src/Auth/AdonisgooseModelAuthProvider'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = (await import('@ioc:Adonis/Lucid/Database')).default
|   const Event = (await import('@ioc:Adonis/Core/Event')).default
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class MongoProvider {
  constructor(protected app: ApplicationContract) {
    return
  }
  public static needsApplication = true

  private registerDatabase() {
    this.app.container.singleton('CuC/AdonisGoose', () => {
      const config = this.app.container.resolveBinding('Adonis/Core/Config').get('mongo', {})
      try {
        mongoose.connect(config.url, config.config)
      } catch (error) {
        throw new Error(`failed to connect to Mongo: ${(<Error>error).message}`)
      }
      return mongoose
    })
  }

  public register() {
    this.registerDatabase()
  }

  public boot(): void {
    if (this.app.container.hasBinding('Adonis/Addons/Auth')) {
      const Auth = this.app.container.resolveBinding('Adonis/Addons/Auth')
      Auth.extend('provider', 'adonisgoose', getAdonisGooseAuthProvider)
    }
  }

  public async shutdown() {
    await this.app.container.use('CuC/AdonisGoose').manager.closeAll()
  }
}
