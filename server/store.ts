import { Datastore, Query } from '@google-cloud/datastore'

export type UserStoreEntity = {
  username: string
  email: string
  forums_id: number
  discord_id: number
  teamspeak_id: string
}

class StoreClient {
  private _store: Datastore

  constructor() {
    this._store = new Datastore({
      projectId: process.env.GOOGLE_PROJECT_ID,
      namespace: 'authenticated_users',
      credentials: require('./config/gcp-key.json')
    })
  }

  async add(username: string, email: string, forumsId: number) {
    const userKey = this._store.key('User')
    const entity = {
      key: userKey,
      data: [
        {
          name: 'username',
          value: username
        },
        {
          name: 'email',
          value: email,
          excludeFromIndexes: true
        },
        {
          name: 'forums_id',
          value: forumsId,
          excludeFromIndexes: true
        }
      ]
    }

    try {
      await this._store.save(entity)
    } catch (err) {
      throw new Error('Error while saving initial user entity to GCP Datastore')
    }
  }

  async find(username: string): Promise<UserStoreEntity> {
    try {
      const query: Query = this._store.createQuery('User').filter('username', '=', username)
      const [users] = await this._store.runQuery(query)

      if (users.length >= 1) return users[0]
      else throw new Error(`No authenticated users found for ${username}`)
    } catch (err) {
      throw new Error('Error while running the query in Datastore')
    }
  }
}

export default new StoreClient()
