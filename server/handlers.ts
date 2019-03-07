import { Request, Response, NextFunction } from 'express'
import * as OAuth2Strategy from 'passport-oauth2'
import fetch, { RequestInit } from 'node-fetch'
import * as shortid from 'shortid'
import storeClient, { UserStoreEntity } from './lib/store'
import mailClient from './lib/mail'
import { io, AuthenticationAttempt } from './server'
import { nextHandler } from './nextApp'

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

type DiscordUser = {
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

type ForumsUser = {
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
 * Check whether there is a user registered on the forums with
 * the same username as found in the Discord OAuth user process
 * @param {string} username
 * @returns {Promise<{ id: number, email: string } | null>}
 */
async function getForumsUser(username: string): Promise<{ id: number; email: string } | null> {
  const res = await fetch(
    `${process.env.FORUMS_API_BASE}/core/members&name=${encodeURIComponent(username)}`,
    requestOptions()
  )
  const users: ForumsUser[] = await res.json().then(res => res.results)

  if (users.length === 0) return null
  return { id: users[0].id, email: users[0].email }
}

/**
 * Check the logged in TeamSpeak users on the server to see if
 * there is a user matching the argued username on the server
 * @export
 * @param {string} username
 * @returns {Promise<boolean>}
 */
async function getTeamspeakUser(_username: string): Promise<boolean> {
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
 * Verify that a use exists on the forums for session's passport user
 * and attaches the forum ID and email to the session user if they do
 * exist on the forums
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} _next
 */
export async function verifyForums(req: Request, res: Response, _next: NextFunction) {
  try {
    const { username } = req.session.passport.user
    const forumsUser: { email: string; id: number } | null = await getForumsUser(username)

    if (forumsUser) {
      req.session.passport.user.forumsId = forumsUser.id
      req.session.passport.user.forumsEmail = forumsUser.email
    }

    res.redirect(`/auth/complete?ref=forums&status=${forumsUser !== null ? 'success' : 'failed'}`)
  } catch (err) {
    io.sockets.connected[req.cookies.ioId].emit('auth_error', err.message)
    res.redirect('/auth/complete?ref=forums&status=error')
  }
}

/**
 * Based on the username in the request session, check if the Teamspeak
 * has a user currently logged in that matches. If so, the function attaches
 * their unique Teamspeak client ID to the session user body
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} _next
 */
// TODO:
export async function verifyTeamspeak(req: Request, res: Response, _next: NextFunction) {
  try {
    const { username } = req.session.passport.user
    const found: boolean = await getTeamspeakUser(username)
    req.session.passport.user.teamspeakId = 'kh42fno4eijp2jc2o'
    res.redirect(`/auth/complete?ref=teamspeak&status=${found ? 'success' : 'failed'}`)
  } catch (err) {
    io.sockets.connected[req.cookies.ioId].emit('auth_error', err.message)
    res.redirect('/auth/complete?ref=teamspeak&status=error')
  }
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
export async function verifyDiscord(
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
 * Gets the referring authentication provider and the status of its attempt
 * and decides which provider is next in line to attempt on a previously
 * successful authentication. Also emits socket.io event for the front-end
 * to handle a failed or successful authentication
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} _next
 */
export async function completeAuthProvider(req: Request, res: Response, _next: NextFunction) {
  const { ref, status } = req.query
  const next = ref === 'discord' ? 'forums' : ref === 'forums' ? 'teamspeak' : null

  const socketData: AuthenticationAttempt = {
    success: status === 'success',
    provider: ref,
    next
  }

  io.sockets.connected[req.cookies.ioId].emit('auth_attempt', socketData)

  if (status === 'success' && ref === 'teamspeak') {
    io.sockets.connected[req.cookies.ioId].emit('auth_complete', req.session.passport.user.username)
  }

  nextHandler(req, res)
}

/**
 * Checks if the user is within the Google Cloud Datastore instance
 * for all authenticated users. If they are in the store, then generate
 * a shortid token to be used for temporary and one-time-use user validation
 * on external applications. The generated token is emailed to the user based
 * on the email address associated with them in the datastore, and it returned
 * as a response to the original calling application request for cross-validation.
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction}
 */
export async function issueToken(req: Request, res: Response, _next: NextFunction) {
  try {
    const { username } = req.body
    const token = shortid.generate()

    const user = await storeClient.find(username)
    await mailClient.send(token, user.email)

    res.status(200).json({ ttl: 300, token })
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

/**
 * Handles the router called specifically for saving the authentcation user
 * session and passport data in the Google Cloud datastore instance
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} _next
 */
// TODO:
export async function addAuthenticatedUser(req: Request, res: Response, _next: NextFunction) {
  try {
    const entity: UserStoreEntity = {
      username: req.session.passport.user.username,
      email: req.session.passport.user.forumsEmail,
      forums_id: req.session.passport.user.forumsId,
      discord_id: req.session.passport.user.id,
      teamspeak_id: req.session.passport.user.teamspeakId
    }

    const deleted: boolean = await storeClient.deleteOldEntry(entity.username)
    await storeClient.add(entity)

    res.status(200).json({ hadPrevious: deleted, user: entity })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

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
 * DiscordAuth
 * @type {OAuth2Strategy}
 * @export
 */
export const DiscordAuth: OAuth2Strategy = new OAuth2Strategy(oauth2DiscordOptions, verifyDiscord)
