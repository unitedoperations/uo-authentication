import { Request, Response, NextFunction } from 'express'
import * as OAuth2Strategy from 'passport-oauth2'
import fetch, { RequestInit } from 'node-fetch'
import * as Pusher from 'pusher'
import * as shortid from 'shortid'
import storeClient from './lib/store'
import mailClient from './lib/mail'
import tsClient from './lib/teamspeak'
import { io, AuthenticationAttempt } from './server'
import { nextHandler } from './nextApp'
import {
  Nullable,
  ForumsUser,
  TeamspeakUser,
  DiscordUser,
  UserStoreEntity,
  TeamspeakGroups
} from './types'

/**
 * Object containing the mappings for the most common forums
 * groups to the corresponding Discord roles on the server
 * @type {Record<string, { discord?: string, ts?: TeamspeakGroups }>}
 */
// TODO: Update UI to alert of roles being assigned
const ForumsGroupMap: Record<string, { discord?: string; ts?: TeamspeakGroups }> = {
  Members: {
    ts: TeamspeakGroups.Member
  },
  'Donating Members': {
    discord: 'Donors',
    ts: TeamspeakGroups.DonorMember
  },
  'Donating Officers': {
    ts: TeamspeakGroups.DonorOfficer
  },
  'Game Server Officer': {
    discord: 'GSO Officers',
    ts: TeamspeakGroups.GameServerOfficer
  },
  'Web Server Officer': {
    discord: 'WSO Officers',
    ts: TeamspeakGroups.WebServerOfficer
  },
  'Public Relations Officer': {
    discord: 'PSO Officers',
    ts: TeamspeakGroups.PublicRelationsOfficer
  },
  'UOAF Officer': {
    discord: 'AFO Officers',
    ts: TeamspeakGroups.AirForcesOfficer
  },
  Regulars: {
    discord: 'Regulars',
    ts: TeamspeakGroups.Regular
  },
  'Donating Regulars': {
    ts: TeamspeakGroups.DonorRegular
  },
  'MMO - DELEGATES': {
    discord: 'MMO Delegates'
  },
  'UOTC Delegate': {
    discord: 'UOTC Delegates'
  },
  'UOTC Instructor': {
    discord: 'UOTC D (Instructor)',
    ts: TeamspeakGroups.UOTCInstructor
  }
}

/**
 * Pusher SDK instance to act as a publisher for downstream
 * platform application
 * @type {Pusher}
 */
const publisher: Pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
})

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
 * Publishes an event to the Pusher platform stream on the appropriate channel
 * for containing a payload that specifies the Discord user ID and a list
 * of roles to be assigned to that user by the server's chatbot. The chatbot on Discord
 * will be listening for events on this channel and will assign roles accordiningly.
 * @param {string} discordId
 * @param {string} username
 */
async function publishDiscordAddRoleEvent(discordId: string, username: string) {
  const user: Nullable<ForumsUser> = await getForumsUser(username)
  const roles: string[] = [user.primaryGroup.name, ...user.secondaryGroups.map(g => g.name)]
    .map(g => ForumsGroupMap[g].discord || null)
    .filter(r => r)

  publisher.trigger('discord_permissions', 'assign', { id: discordId, roles })
}

/**
 * Publishes the role revocation event to the Pusher platform on the Discord
 * permissioning channel. The chatbot is listening for these events to reset and
 * Discord user ID's server roles.
 * @param {string} discordId
 */
async function publishDiscordRemoveRoleEvent(discordId: string) {
  publisher.trigger('discord_permissions', 'revoke', { id: discordId })
}

/**
 * Check whether there is a user registered on the forums with
 * the same username as found in the Discord OAuth user process
 * @param {string} username
 * @returns {Promise<ForumsUser | null>}
 */
async function getForumsUser(username: string): Promise<Nullable<ForumsUser>> {
  const res = await fetch(
    `${process.env.FORUMS_API_BASE}/core/members&name=${encodeURIComponent(username)}`,
    requestOptions()
  )
  const users: ForumsUser[] = await res.json().then(res => res.results)

  if (users.length === 0) {
    return null
  } else if (users.length === 1) {
    return users[0]
  } else {
    for (const u of users) {
      if (u.name === username) return u
    }
  }

  return null
}

/**
 * Check the logged in TeamSpeak users on the server to see if
 * there is a user matching the argued username on the server
 * @export
 * @param {string} username
 * @returns {Promise<TeamspeakUser | null>}
 */
async function getTeamspeakUser(username: string): Promise<Nullable<TeamspeakUser>> {
  const client: Nullable<Pick<TeamspeakUser, 'cid' | 'client_nickname'>> = await tsClient.send(
    'clientfind',
    { pattern: username }
  )
  if (!client) return null

  return tsClient.send('clientinfo', { clid: client.cid })
}

/**
 * Verify that a use exists on the forums for session's passport user
 * and attaches the forum ID and email to the session user if they do
 * exist on the forums. Sends a socket event to the front-end distinguishing
 * with groups assigned to the forums account will and won't be tranfered by
 * the system on the respective platforms
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} _next
 */
export async function verifyForums(req: Request, res: Response, _next: NextFunction) {
  try {
    const { username } = req.session.passport.user
    const forumsUser: Nullable<ForumsUser> = await getForumsUser(username)

    if (forumsUser) {
      req.session.passport.user.forumsId = forumsUser.id
      req.session.passport.user.forumsEmail = forumsUser.email
    }

    const groupsAssignedOnForums: string[] = [
      forumsUser.primaryGroup.name,
      ...forumsUser.secondaryGroups.map(g => g.name)
    ]
    const willTransfer: string[] = Object.keys(ForumsGroupMap).filter(k =>
      groupsAssignedOnForums.includes(k)
    )
    const wontTransfer: string[] = groupsAssignedOnForums.filter(g => !willTransfer.includes(g))

    io.sockets.connected[req.cookies.ioId].emit('group_transfers', {
      will: willTransfer,
      wont: wontTransfer
    })
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
export async function verifyTeamspeak(req: Request, res: Response, _next: NextFunction) {
  try {
    const { username } = req.session.passport.user
    const client: Nullable<TeamspeakUser> = await getTeamspeakUser(username)
    req.session.passport.user.teamspeakId = client.client_unqiue_identifier
    req.session.passport.user.ip = client.connection_client_ip
    res.redirect(`/auth/complete?ref=teamspeak&status=${client !== null ? 'success' : 'failed'}`)
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
export async function addAuthenticatedUser(req: Request, res: Response, _next: NextFunction) {
  try {
    const entity: UserStoreEntity = {
      username: req.session.passport.user.username,
      email: req.session.passport.user.forumsEmail,
      forums_id: req.session.passport.user.forumsId,
      discord_id: req.session.passport.user.id,
      teamspeak_id: req.session.passport.user.teamspeakId,
      ip: req.session.passport.user.ip,
      createdAt: new Date().toISOString()
    }

    const oldEntity: Nullable<UserStoreEntity> = await storeClient.archiveEntry(entity.username)
    if (oldEntity) {
      await publishDiscordRemoveRoleEvent(entity.discord_id)
    }

    await storeClient.add(entity)
    await publishDiscordAddRoleEvent(entity.discord_id, entity.username)

    // TODO: Revoke old and assign new Teamspeak server groups

    res.status(200).json({ hadPrevious: oldEntity !== null, user: entity })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Configuration options for the OAuth2 Discord passport provider
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

/**
 * Configuration options for the OAuth2 Forums passport provider
 * @type {OAuth2Strategy.StrategyOptions}
 */
// TODO: const oauth2ForumsOptions: OAuth2Strategy.StrategyOptions = {}

/**
 * ForumsAuth
 * @type {OAuth2Strategy}
 * @export
 */
// TODO: export const ForumsAuth: OAuth2Strategy = new OAuth2Strategy(oauth2ForumsOptions, verifyForums)
