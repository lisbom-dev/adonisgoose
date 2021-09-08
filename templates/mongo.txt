import Env from '@ioc:Adonis/Core/Env'
import Mongo from '@ioc:CuC/AdonisGoose'

interface MongoConfig {
  url: string
  config?: Mongo.ConnectOptions
}

const mongoConfig: MongoConfig = {
  url: Env.get('MONGODB_URL'),
}

export default mongoConfig
