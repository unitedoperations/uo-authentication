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

export type SerializedUser = {
  discord: DiscordUser
  forums: ForumsUser
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
  callbackURL: 'https://uo-auth-dev.localtunnel.me/auth/discord/callback',
  scope: ['identify', 'email']
}

/**
 * Retrieve the logged in user for Discord after successful OAuth2
 * authentication using the access token bearer to detect user
 * @param {string} token
 * @returns {Promise<DiscordUser>}
 */
async function getDiscordUser(token: string): Promise<DiscordUser> {
  const res = await fetch(
    'https://discordapp.com/api/users/@me',
    requestOptions({ headers: { Authorization: `Bearer ${token}` } })
  )
  return res.json() as Promise<DiscordUser>
}

/**
 * Strategy verification function that compiles the Discord
 * and derived forums user objects based on the found email address
 * into the serializable user object for passport to pass into the
 * request object in other API calls
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
    const discordUser = await getDiscordUser(accessToken)
    const res = await fetch(
      `${process.env.FORUMS_API_BASE}/core/members&email=${encodeURIComponent(discordUser.email)}`,
      requestOptions()
    )
    const resJson = await res.json()

    const serializableUser: SerializedUser = {
      discord: discordUser,
      forums: resJson.results[0]
    }

    done(null, serializableUser)
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
