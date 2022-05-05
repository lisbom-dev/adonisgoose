import { esmResolver } from '@poppinss/utils'
import {
  AuthManagerContract,
  ProviderUserContract,
  UserProviderContract,
} from '@ioc:Adonis/Addons/Auth'
import { HashDriverContract } from '@ioc:Adonis/Core/Hash'
import { ObjectId } from 'mongodb'

import type { Document, Model } from 'mongoose'
import { AdonisgooseAuthProviderConfig } from '@ioc:CuC/AdonisGoose'

class AdonisGooseModelAuthProviderUser implements ProviderUserContract<Document<unknown>> {
  constructor(
    // `this.user` can be any Model, so we use `any` to avoid indexing issues later.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public user: any,
    private identifierKey: string,
    private identifierKeyType: 'objectid' | 'string' | 'number',
    private hash: HashDriverContract
  ) {}

  public getId(): string | number | null {
    if (this.user === null) return null
    const value = this.user[this.identifierKey]
    if (this.identifierKeyType === 'objectid') {
      return value.toString()
    }
    return value
  }

  public verifyPassword(plainPassword: string): Promise<boolean> {
    if (this.user === null) {
      throw new Error('Cannot "verifyPassword for non-existing user')
    }
    if (!this.user.password) {
      throw new Error('Auth user object must have a password in order to call "verifyPassword"')
    }

    return this.hash.verify(this.user.password, plainPassword)
  }

  public getRememberMeToken(): string | null {
    return null
  }
  public setRememberMeToken(): void {
    throw new Error('unimplemented setRememberMeToken')
  }
}

class AdonisGooseModelAuthUserProvider implements UserProviderContract<Document<unknown>> {
  private uids = ['email']
  private identifierKey = '_id'
  private identifierKeyType: 'objectid' | 'string' | 'number' = 'objectid'
  private hash: HashDriverContract

  constructor(
    private auth: AuthManagerContract,
    private config: AdonisgooseAuthProviderConfig<Model<unknown>>
  ) {
    if (config.uids) {
      if (config.uids.length === 0) {
        throw new Error('config.uids must have at least one element')
      }
      this.uids = config.uids as string[]
    }

    if (config.identifierKey) {
      this.identifierKey = config.identifierKey as string
    }

    if (config.identifierKeyType) {
      this.identifierKeyType = config.identifierKeyType
    }

    const Hash = this.auth.application.container.resolveBinding('Adonis/Core/Hash')
    this.hash = config.hashDriver ? Hash.use(config.hashDriver as never) : Hash
  }

  private async getModel(): Promise<Model<unknown>> {
    if (this.config.model) {
      return esmResolver(await this.config.model())
    } else {
      return esmResolver(await this.auth.application.container.useAsync('App/Models/User'))
    }
  }

  public async getUserFor(user: Document<unknown>): Promise<AdonisGooseModelAuthProviderUser> {
    return new AdonisGooseModelAuthProviderUser(
      user,
      this.identifierKey,
      this.identifierKeyType,
      this.hash
    )
  }

  public async findById(id: string | number): Promise<AdonisGooseModelAuthProviderUser> {
    const Model = await this.getModel()
    const user = await Model.findOne({
      [this.identifierKey]: this.identifierKeyType === 'objectid' ? new ObjectId(id) : id,
    })
    return new AdonisGooseModelAuthProviderUser(
      user,
      this.identifierKey,
      this.identifierKeyType,
      this.hash
    )
  }

  public async findByUid(uid: string | number): Promise<AdonisGooseModelAuthProviderUser> {
    const Model = await this.getModel()
    const $or = this.uids.map((uidKey) => ({ [uidKey]: uid }))
    const user = await Model.findOne({ $or })
    return new AdonisGooseModelAuthProviderUser(
      user,
      this.identifierKey,
      this.identifierKeyType,
      this.hash
    )
  }

  public async findByRememberMeToken(/* userId: string | number, token: string */): Promise<AdonisGooseModelAuthProviderUser> {
    throw new Error('unimplemented findByRememberMeToken')
    // return new AdonisGooseModelAuthProviderUser(null);
  }

  public updateRememberMeToken(/* authenticatable: AdonisGooseModelAuthProviderUser */): Promise<void> {
    throw new Error('unimplemented updateRememberMeToken')
  }
}

export function getAdonisGooseAuthProvider(
  auth: AuthManagerContract,
  _mapping: string,
  config: AdonisgooseAuthProviderConfig<Model<unknown>>
) {
  return new AdonisGooseModelAuthUserProvider(auth, config)
}
