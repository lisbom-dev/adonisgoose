import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import * as sinkStatic from '@adonisjs/sink'
import { join } from 'path'

function getStub(...relativePaths: string[]) {
  return join(__dirname, 'templates', ...relativePaths)
}

export default async function instructions(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic
) {
  const configPath = app.configPath('mongo.txt')
  const databaseConfig = new sink.files.MustacheFile(projectRoot, configPath, getStub('mongo.ts'))
  databaseConfig.overwrite = true
  databaseConfig.apply().commit()

  const env = new sink.files.EnvFile(projectRoot)
  env.set('MONGODB_URL', 'localhost:27017')
  env.commit()
  sink.logger.action('update').succeeded('.env,.env.example')
}
