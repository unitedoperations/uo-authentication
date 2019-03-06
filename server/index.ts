require('dotenv').config()
import { Request, Response } from 'express'
import * as http from 'http'
import * as next from 'next'
import * as cors from 'cors'
import * as socketIO from 'socket.io'
import * as passport from 'passport'
import * as shortid from 'shortid'
import { DiscordAuth, getForumsUser, getTeamspeakUser } from './authentication'
import expressApp from './expressApp'
import storeClient, { UserStoreEntity } from './store'
import mailClient from './mail'
import { validateAPIKey } from './middleware'

passport.use(DiscordAuth)
passport.serializeUser((user: unknown, done: any) => {
  done(null, user)
})
passport.deserializeUser((user: unknown, done: any) => {
  done(null, user)
})

const server: http.Server = new http.Server(expressApp)
const io: socketIO.Server = socketIO(server, {
  serveClient: false
})

export type AuthenticationProvider = 'discord' | 'forums' | 'teamspeak'
export interface AuthenticationAttempt {
  success: boolean
  provider: AuthenticationProvider
  next: AuthenticationProvider | null
}

io.on('connection', _socket => {
  console.log('New socket connection!')
})

const nextApp: next.Server = next({ dev: process.env.NODE_ENV !== 'production' })
const handler = nextApp.getRequestHandler()
nextApp
  .prepare()
  .then(() => {
    expressApp.get('/auth/discord', passport.authenticate('oauth2'))

    expressApp.get('/auth/forums', async (req: Request, res: Response) => {
      try {
        const { username } = req.session.passport.user
        const items: [number, string] | null = await getForumsUser(username)

        if (items) {
          req.session.passport.user.forumsId = items[0]
          req.session.passport.user.forumsEmail = items[1]
        }

        res.redirect(`/auth/complete?ref=forums&status=${items !== null ? 'success' : 'failed'}`)
      } catch (err) {
        io.sockets.emit('auth_error', err.message)
        res.redirect('/auth/complete?ref=forums&status=error')
      }
    })

    expressApp.get('/auth/teamspeak', async (req: Request, res: Response) => {
      try {
        const { username } = req.session.passport.user
        const found: boolean = await getTeamspeakUser(username)
        res.redirect(`/auth/complete?ref=teamspeak&status=${found ? 'success' : 'failed'}`)
      } catch (err) {
        console.log(err)
        io.sockets.emit('auth_error', err.message)
        res.redirect('/auth/complete?ref=teamspeak&status=error')
      }
    })

    expressApp.get(
      '/auth/discord/callback',
      passport.authenticate('oauth2', {
        failureRedirect: '/auth/complete?ref=discord&status=fail'
      }),
      (_req: Request, res: Response) => {
        res.redirect('/auth/complete?ref=discord&status=success')
      }
    )

    expressApp.get('/auth/complete', (req: Request, res: Response) => {
      console.log(req.session)
      const { ref, status } = req.query
      const next = ref === 'discord' ? 'forums' : ref === 'forums' ? 'teamspeak' : null

      const socketData: AuthenticationAttempt = {
        success: status === 'success',
        provider: ref,
        next
      }

      io.sockets.emit('auth_attempt', socketData)
      handler(req, res)
    })

    expressApp.post('/auth/token', cors(), validateAPIKey, async (req: Request, res: Response) => {
      try {
        const { username } = req.body
        const token = shortid.generate()

        const user: UserStoreEntity = await storeClient.find(username)

        mailClient.send(token, user.email)
        res.status(200).json({ ttl: 300, token })
      } catch (err) {
        res.status(404).json({ error: err.message })
      }
    })

    expressApp.get('*', (req: Request, res: Response) => {
      handler(req, res)
    })

    server.listen(expressApp.get('port'), (err: any) => {
      if (err) throw err
      console.log(`Listening on :${expressApp.get('port')}`)
    })
  })
  .catch(console.error)
