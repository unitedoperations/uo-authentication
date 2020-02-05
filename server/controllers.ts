import { Request, Response, NextFunction } from 'express'
import { credentials } from 'grpc'
import OAuth2Strategy from 'passport-oauth2'
import fetch, { RequestInit } from 'node-fetch'
import * as shortid from 'shortid'
import storeClient from './lib/store'
import mailClient from './lib/mail'
import tsClient from './lib/teamspeak'
import protoDescriptor from './lib/grpcDescriptor'
import { io, AuthenticationAttempt } from './server'
import { nextHandler } from './nextApp'
import {
  Nullable,
  ForumsUser,
  TeamspeakUser,
  DiscordUser,
  UserStoreEntity,
  TeamspeakServerGroup,
  TeamspeakGroups
} from './types'

/**
 * Object containing the mappings for the most common forums
 * groups to the corresponding Discord roles on the server
 * @type {Record<string, { discord?: string, ts?: TeamspeakGroups }>}
 */
const ForumsGroupMap: Record<string, { discord?: string; ts?: TeamspeakGroups }> = {
  Members: {
    discord: 'Members',
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
 * GRPC client for Discord bot interactions and role provisioning
 */
// @ts-ignore
const discordClient = new protoDescriptor.ProvisionService('localhost:50051', credentials.createInsecure())

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
 * Creates a list of Discord and Teamspeak roles that should be assigned to a given user
 * @param {string} username
 * @returns {[ number[], string[] ]}
 */
async function getPlatformGroups(username: string): Promise<[number[], string[]]> {
  const user: Nullable<ForumsUser> = await getForumsUser(username)
  if (user) {
    const forumGroups: string[] = [user.primaryGroup.name, ...user.secondaryGroups.map(g => g.name)]

    return [
      forumGroups.map(g => ForumsGroupMap[g].ts || null).filter(r => r) as number[],
      forumGroups.map(g => ForumsGroupMap[g].discord || null).filter(r => r) as string[]
    ]
  }
  return [[], []]
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
  const client: Nullable<{ clid: number; client_nickname: string }> = await tsClient.send('clientfind', {
    pattern: username
  })
  if (!client) return null

  return tsClient.send('clientinfo', { clid: client.clid })
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
    const { username } = req.session!.passport.user
    const forumsUser: Nullable<ForumsUser> = await getForumsUser(username)

    if (forumsUser) {
      req.session!.passport.user.forumsId = forumsUser.id
      req.session!.passport.user.forumsEmail = forumsUser.email
    }

    if (forumsUser) {
      const groupsAssignedOnForums: string[] = [
        forumsUser.primaryGroup.name,
        ...forumsUser.secondaryGroups.map(g => g.name)
      ]
      const willTransfer: string[] = Object.keys(ForumsGroupMap).filter(k => groupsAssignedOnForums.includes(k))
      const wontTransfer: string[] = groupsAssignedOnForums.filter(g => !willTransfer.includes(g))

      io.sockets.connected[req.cookies.ioId].emit('group_transfers', {
        will: willTransfer,
        wont: wontTransfer
      })
      res.redirect(`/api/oauth2/complete?ref=forums&status=${forumsUser !== null ? 'success' : 'failed'}`)
    } else {
      throw new Error('Failed to find user in forums')
    }
  } catch (err) {
    io.sockets.connected[req.cookies.ioId].emit('auth_error', err.message)
    res.redirect('/api/oauth2/complete?ref=forums&status=error')
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
    const { username } = req.session!.passport.user
    const client: Nullable<TeamspeakUser> = await getTeamspeakUser(username)
    if (client) {
      req.session!.passport.user.teamspeakId = client.client_unique_identifier
      req.session!.passport.user.teamspeakDBId = client.client_database_id
      req.session!.passport.user.ip = client.connection_client_ip
      res.redirect(`/api/oauth2/complete?ref=teamspeak&status=${client !== null ? 'success' : 'failed'}`)
    } else {
      throw new Error('Failed to get user from Teamspeak')
    }
  } catch (err) {
    io.sockets.connected[req.cookies.ioId].emit('auth_error', err.message)
    res.redirect('/api/oauth2/complete?ref=teamspeak&status=error')
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
export async function verifyDiscord(accessToken: string, _refreshToken: string, _profile: any, done: Function) {
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
    io.sockets.connected[req.cookies.ioId].emit('auth_complete', req.session!.passport.user.username)
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
    const { username }: { username: string } = req.body
    const token: string = shortid.generate()

    const user = await storeClient.find({ username })
    await mailClient.send(token, user.email)

    res.status(200).json({ token })
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

/**
 * Uses the GCP datastore client to search for an authenticated user matching
 * the request parameters and sends it back in a JSON payload
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} _next
 */
export async function getUserInfo(req: Request, res: Response, _next: NextFunction) {
  try {
    const { username } = req.query

    let users: UserStoreEntity[]
    if (username) users = [await storeClient.find({ username })]
    else users = await storeClient.getAllUsers()

    res.status(200).json({ users })
  } catch (err) {
    res.status(404).json({ users: null, error: err.message })
  }
}

/**
 * Collects the argued user's active server groups from Teamspeak
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} _next
 */
export async function getTeamspeakUserGroups(req: Request, res: Response, _next: NextFunction) {
  try {
    const { id } = req.query
    let groups: TeamspeakServerGroup | TeamspeakServerGroup[] = await tsClient.send('servergroupsbyclientid', {
      cldbid: id
    })
    if (!(groups instanceof Array)) groups = [groups]

    res.status(200).json({ groups: groups.map(g => ({ sgid: g.sgid, name: g.name.replace(/\*\s+/g, '') })) })
  } catch (err) {
    res.status(404).json({ groups: null, error: err.message })
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
      username: req.session!.passport.user.username,
      email: req.session!.passport.user.forumsEmail,
      forums_id: req.session!.passport.user.forumsId,
      discord_id: req.session!.passport.user.id,
      teamspeak_id: req.session!.passport.user.teamspeakId,
      teamspeak_db_id: req.session!.passport.user.teamspeakDBId,
      ip: req.session!.passport.user.ip,
      createdAt: new Date().toISOString()
    }

    const hadPrevious: boolean = await storeClient.archiveEntry(entity.forums_id)
    await storeClient.add(entity)
    if (process.env.NODE_ENV === 'production') {
      if (hadPrevious) {
        discordClient.provision(
          { id: entity.discord_id, assign: [], revoke: ['Symbol(all)'] },
          (err: Error, res: any) => {
            if (err || !res.success) throw new Error(JSON.stringify(err))
          }
        )
        await tsClient.remove(entity.teamspeak_db_id)
      }

      const [tsGroups, disRoles] = await getPlatformGroups(entity.username)
      console.log(disRoles)
      await tsClient.assign(tsGroups, entity.teamspeak_db_id)
      discordClient.provision({ id: entity.discord_id, assign: disRoles, revoke: [] }, (err: Error, res: any) => {
        if (err || !res.success) throw new Error(JSON.stringify(err))
      })
    }

    res.status(200).json({ hadPrevious, user: entity })
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
  callbackURL: 'https://auth.unitedoperations.net/api/oauth2/discord/callback',
  scope: ['identify']
}

/**
 * DiscordAuth
 * @type {OAuth2Strategy}
 * @export
 */
export const DiscordAuth: OAuth2Strategy = new OAuth2Strategy(oauth2DiscordOptions, verifyDiscord)
