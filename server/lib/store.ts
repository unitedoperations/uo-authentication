import { Datastore, Query } from '@google-cloud/datastore'

export type UserStoreEntity = {
  username: string
  email: string
  forums_id: number
  discord_id: string
  teamspeak_id: string
}

export type EntityData = {
  name: string
  value: any
  excludeFromIndexes: boolean
}

/**
 * Client to handle interactions with the Google Cloud Datastore instance
 * for holding and storing authenticated user data after they successfully
 * go through the process
 * @export
 * @class StoreClient
 * @private @property {Datastore} _store
 */
class StoreClient {
  private _store: Datastore

  constructor() {
    this._store = new Datastore({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: require('../../keys/datastore-svc-key.json')
    })
  }

  /**
   * Save a new user entity in the authenticated users datastore
   * @throws
   * @param {UserStoreEntity} user
   * @memberof StoreClient
   */
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

  /**
   * If an old authentication entry exists for a user, delete it
   * @param {string} username
   * @returns {Promise<boolean>}
   * @memberof StoreClient
   */
  async deleteOldEntry(username: string): Promise<boolean> {
    let entity: UserStoreEntity

    try {
      entity = await this.find(username)
    } catch (_err) {
      return false
    }

    const key = this._store.key(['User', entity[this._store.KEY].id])
    await this._store.delete(key)
    return true
  }

  /**
   * Filter the authenticated users datastore for entities with
   * that argued username. If none are found throw an error.
   * @throws
   * @param {string} username
   * @returns {(Promise<UserStoreEntity> | never)}
   * @memberof StoreClient
   */
  async find(username: string): Promise<UserStoreEntity> | never {
    const query: Query = this._store.createQuery('User').filter('username', '=', username)
    const [users] = await this._store.runQuery(query)

    if (users.length >= 1) return users[0]
    else throw new Error(`No authenticated users found for ${username}`)
  }
}

export default new StoreClient()
