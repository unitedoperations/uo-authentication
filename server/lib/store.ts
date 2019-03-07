import { Datastore, Query } from '@google-cloud/datastore'

export type UserStoreEntity = {
  username: string
  email: string
  forums_id: number
  discord_id: number
  teamspeak_id: string
}

export type EntityData = {
  name: string
  value: any
  excludeFromIndexes: boolean
}

class StoreClient {
  private _store: Datastore

  constructor() {
    this._store = new Datastore({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: require('../config/gcp-key.json')
    })
  }

  async add(user: UserStoreEntity) {
    const key = this._store.key('User')
    const data: EntityData[] = Object.entries(user).map(([k, v]) => ({
      name: k,
      value: v,
      excludeFromIndexes: k !== 'username' && k !== 'email'
    }))

    try {
      await this._store.save({ key, data })
    } catch (err) {
      throw new Error(
        `Error while saving initial user entity to GCP Datastore for ${user.username}`
      )
    }
  }

  async find(username: string): Promise<UserStoreEntity> {
    const query: Query = this._store.createQuery('User').filter('username', '=', username)
    const [users] = await this._store.runQuery(query)

    if (users.length >= 1) return users[0]
    else throw new Error(`No authenticated users found for ${username}`)
  }
}

export default new StoreClient()
