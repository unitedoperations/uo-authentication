import * as OAuth2Strategy from 'passport-oauth2'
import fetch, { RequestInit } from 'node-fetch'

type Fields = {
  [k: string]: {
    name: string
    value?: string
    fields?: Fields
  }
}

type ForumGroup = {
  id: number
  name: string
  formattedName: string
}

export type DiscordUser = {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  bot?: boolean
  mfa_enabled?: boolean
  locale?: string
  verified?: boolean
  email: string
  flags: number
  premium_type?: number
}

export type ForumsUser = {
  id: number
  name: string
  title: string
  timeZone: string
  formattedName: string
  primaryGroup: ForumGroup[]
  secondaryGroups: ForumGroup[]
  email: string
  joined: string
  registrationIpAddress: string
  warningPoints: number
  reputationPoints: number
  photoUrl: string
  photoUrlIsDefault: boolean
  coverPhotoUrl: string
  profileUrl: string
  validating: boolean
  posts: number
  lastActivity: string
  lastVisit: string
  lastPost: string
  profileViews: number
  birthday: string
  customFields: Fields
}

/**
 * Creates the HTTP request options object for fetch calls
 * @param {Partial<RequestInit>} [others = {}]
 * @returns {RequestInit}
 */
const requestOptions = (other: Partial<RequestInit> = {}): RequestInit => ({
  headers: {
    Authorization: `Basic ${Buffer.from(`${process.env.FORUMS_API_KEY}:`).toString('base64')}`,
    ...other.headers
  },
  ...other
})

/**
 * Configuration options for the OAuth2 passport provider
 * @type {OAuth2Strategy.StrategyOptions}
 */
const oauth2DiscordOptions: OAuth2Strategy.StrategyOptions = {
  clientID: process.env.DISCORD_CLIENT_ID as string,
  clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
  authorizationURL: 'https://discordapp.com/api/oauth2/authorize',
  tokenURL: 'https://discordapp.com/api/oauth2/token',
  callbackURL: 'http://localhost:8080/auth/discord/callback',
  scope: ['identify']
}

/**
 * Check whether there is a user registered on the forums with
 * the same username as found in the Discord OAuth user process
 * @export
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export async function hasForumsUser(username: string): Promise<boolean> {
  const res = await fetch(
    `${process.env.FORUMS_API_BASE}/core/members&name=${encodeURIComponent(username)}`,
    requestOptions()
  )
  const users: ForumsUser[] = await res.json().then(res => res.results)
  return users.some(u => u.name === username)
}

/**
 * Check the logged in TeamSpeak users on the server to see if
 * there is a user matching the argued username on the server
 * @export
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export async function hasTeamspeakUser(_username: string): Promise<boolean> {
  // const ts = new TeamSpeakClient('ts3.unitedoperations.net:9987')
  // return ts.send(
  //   'login',
  //   { client_login_name: 'UOAuthenticator', client_login_password: 'grits' },
  //   (err: Error, _res: any, _raw: any) => {
  //     if (err) throw err
  //     ts.send('clientlist', (err: Error, res: any, _raw: any) => {
  //       if (err) throw err
  //       console.log(res)
  //       return true
  //     })
  //   }
  // )
  return true
}

/**
 * Strategy verification function that fetches the currently
 * authenticated Discord user's information for subsequent
 * called to other authentication providers
 * @param {string} accessToken
 * @param {string} _refreshToken
 * @param {unknown} _profile
 * @param {Function} done
 */
async function verifyDiscord(
  accessToken: string,
  _refreshToken: string,
  _profile: any,
  done: Function
) {
  try {
    const res = await fetch(
      'https://discordapp.com/api/users/@me',
      requestOptions({ headers: { Authorization: `Bearer ${accessToken}` } })
    )
    const discordUser: DiscordUser = await res.json()

    done(null, discordUser)
  } catch (e) {
    done(e, null)
  }
}

/**
 * DiscordAuth
 * @type {OAuth2Strategy}
 * @export
 */
export const DiscordAuth: OAuth2Strategy = new OAuth2Strategy(oauth2DiscordOptions, verifyDiscord)
