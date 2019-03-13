import * as Teamspeak from 'node-teamspeak'

/**
 * Wrapper client for the node Teamspeak package
 * to handle interactions with the UO Teamspeak server
 * @export
 * @class TeamspeakClient
 * @private @property {Teamspeak} _ts
 */
class TeamspeakClient {
  private _ts: Teamspeak

  /**
   * Creates an instance of TeamspeakClient.
   * @param {string} address
   * @memberof TeamspeakClient
   */
  constructor(address: string) {
    this._ts = new Teamspeak(address)
    this._connect()
  }

  /**
   * Promise wrapper for issuing a Teamspeak server command and returns
   * the result of the command as the resolution
   * @param {string} cmd
   * @param {Record<string, any>} [payload]
   * @returns {Promise<any>}
   * @memberof TeamspeakClient
   */
  send(cmd: string, payload?: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this._ts.send(cmd, payload, (err: Error, res: any) => {
        if (err) reject(err)
        resolve(res)
      })
    })
  }

  /**
   * Assign a specific Teamspeak client a list of server group's by ID
   * @param {number[]} groupIds
   * @param {number} clientDBId
   * @memberof TeamspeakClient
   */
  async assign(groupIds: number[], clientDBId: number) {
    try {
      for (const id of groupIds) {
        await this.send('servergroupaddclient', { sgid: id, cldbid: clientDBId })
      }
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * Remove all server groups from the given client database ID
   * @param {number} clientDBId
   * @memberof TeamspeakClient
   */
  async remove(clientDBId: number) {
    try {
      const res: any | any[] = await this.send('servergroupsbyclientid', { cldbid: clientDBId })
      const sgids: number[] = res instanceof Array ? res.map(r => r.sgid) : [res.sgid]

      for (const id of sgids) {
        await this.send('servergroupdelclient', { sgid: id, cldbid: clientDBId })
      }
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * Sends the 'quit' command for the TS client
   * to terminate its session and disconnect from the server
   * @memberof TeamspeakClient
   */
  disconnect() {
    this.send('quit')
  }

  /**
   * Begin the Teamspeak client session to persist
   * through the duration of the application
   * @private
   * @memberof TeamspeakClient
   */
  private async _connect() {
    try {
      await this._login()
      await this._use(1)
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * Promise wrapper for the Teamspeak
   * client 'login' command
   * @private
   * @returns {Promise<void>}
   * @memberof TeamspeakClient
   */
  private _login(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._ts.send(
        'login',
        {
          client_login_name: process.env.TEAMSPEAK_USER,
          client_login_password: process.env.TEAMSPEAK_PASS
        },
        (err: Error) => {
          if (err) reject(err)
          resolve()
        }
      )
    })
  }

  /**
   * Promise wrapper for the Teamspeak 'use' command
   * @private
   * @param {number} [sid=1]
   * @returns {Promise<void>}
   * @memberof TeamspeakClient
   */
  private _use(sid: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      this._ts.send('use', { sid }, (err: Error) => {
        if (err) reject(err)
        resolve()
      })
    })
  }
}

export default new TeamspeakClient('ts3.unitedoperations.net')
