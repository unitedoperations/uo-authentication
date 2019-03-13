import { Datastore, Query } from '@google-cloud/datastore'
import { UserStoreEntity, EntityData, Nullable, Throwable } from '../types'

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
    const data: EntityData[] = Object.entries(user).map(([k, v]: [keyof UserStoreEntity, any]) => ({
      name: k,
      value: v,
      excludeFromIndexes: k !== 'forums_id'
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
   * If an old authentication entry exists for a user, delete it from the active list
   * and add it to the archives of authentications
   * @param {string} username
   * @returns {Promise<UserStoreEntity | null>}
   * @memberof StoreClient
   */
  async archiveEntry(username: string): Promise<Nullable<UserStoreEntity>> {
    let entity: UserStoreEntity

    try {
      entity = await this.find(username)
    } catch (_err) {
      return null
    }

    const archiveKey = this._store.key({
      namespace: 'archived_auths',
      path: ['User', entity[this._store.KEY].id]
    })
    await this._store.save({ key: archiveKey, data: entity })

    const deleteKey = this._store.key(['User', entity[this._store.KEY].id])
    await this._store.delete(deleteKey)

    return entity
  }

  /**
   * Filter the authenticated users datastore for entities with
   * that argued username. If none are found throw an error.
   * @throws
   * @param {string} username
   * @returns {(Promise<UserStoreEntity> | never)}
   * @memberof StoreClient
   */
  async find(username: string): Throwable<Promise<UserStoreEntity>> {
    const query: Query = this._store.createQuery('User').filter('username', '=', username)
    const [users] = await this._store.runQuery(query)

    if (users.length >= 1) return users[0]
    else throw new Error(`No authenticated users found for ${username}`)
  }
}

export default new StoreClient()
