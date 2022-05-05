declare module '@ioc:CuC/AdonisGoose' {
  import { UserProviderContract } from '@ioc:Adonis/Addons/Auth'
  import { Model } from 'mongoose'
  import { HashersList } from '@ioc:Adonis/Core/Hash'
  import mongoose from 'mongoose'
  export default mongoose
  export interface ModelDocumentOptions<DriverOptionType> {
    driverOptions?: Omit<DriverOptionType, 'session'>
  }
  type DollarProperties<T> = Extract<keyof T, `$${string}`>
  type FunctionProperties<T> = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T]: T[K] extends Function ? K : never
  }[keyof T]
  type ModelSpecial = 'id'
  type ModelAttributes<T> = Omit<
    T,
    ModelSpecial | DollarProperties<T> | FunctionProperties<Omit<T, DollarProperties<T>>>
  >
  export interface AdonisgooseAuthProviderContract<User extends Model<unknown>>
    extends UserProviderContract<InstanceType<User>> {}

  export interface AdonisgooseAuthProviderConfig<User extends Model<unknown>> {
    driver: 'adonisgoose'
    /**
     * Function that imports the user model.
     * @default () => import('App/Models/User')
     */
    model?: () =>
      | Promise<User>
      | Promise<{
          default: User
        }>
    /**
     * List of keys used to search the user.
     * @default ['email']
     */
    uids?: (keyof ModelAttributes<InstanceType<User>>)[]
    /**
     * Unique key on the user object.
     * @default _id
     */
    identifierKey?: keyof ModelAttributes<InstanceType<User>>
    /**
     * Value type for `identifierKey`.
     * @default 'objectid'
     */
    identifierKeyType?: 'objectid' | 'string' | 'number'
    /**
     * Hash driver used to hash the password.
     */
    hashDriver?: keyof HashersList
  }
}
