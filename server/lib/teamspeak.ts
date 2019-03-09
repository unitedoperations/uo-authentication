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
  }

  /**
   * Issues a Teamspeak server command after logging in and returns
   * the result of the command after quiting the session
   * @param {string} cmd
   * @param {Record<string, any>} [payload]
   * @returns {Promise<any>}
   * @memberof TeamspeakClient
   */
  send(cmd: string, payload?: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this._login()
        this._ts.send(cmd, payload, (err: Error, res: any) => {
          if (err) reject(err)
          this._ts.send('quit')
          resolve(res)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Initiates the login procedure for the client
   * that is required before sending commands
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
          this._ts.send('use', { sid: 1 }, (err: Error) => {
            if (err) reject(err)
            resolve()
          })
        }
      )
    })
  }
}

export default new TeamspeakClient('ts3.unitedoperations.net')
