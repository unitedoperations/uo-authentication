require('dotenv').config()
import * as http from 'http'
import * as next from 'next'
import * as socketIO from 'socket.io'
import * as express from 'express'
import * as helmet from 'helmet'
import * as compression from 'compression'
import * as morgan from 'morgan'
import * as passport from 'passport'
import { DiscordAuth } from './authentication'

const expressApp: express.Express = express()
expressApp.set('port', process.env.PORT || 8080)
expressApp.use(morgan('dev'))
expressApp.use(helmet())
expressApp.use(compression())
expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: false }))
expressApp.use(passport.initialize())
expressApp.use(passport.session())

passport.use(DiscordAuth)
passport.serializeUser((user: unknown, done: any) => {
  done(null, user)
})
passport.deserializeUser((user: unknown, done: any) => {
  done(null, user)
})

const server: http.Server = new http.Server(expressApp)
const io: socketIO.Server = socketIO(server, {
  path: '/io',
  serveClient: false
})

export type AuthenticationProvider = 'discord' | 'forums' | 'teamspeak'
export type AuthenticationAttempt = {
  success: boolean
  provider: AuthenticationProvider
  payload?: any
  next?: AuthenticationProvider
}

io.on('connection', socket => {
  console.log('New socket connection!')
  socket.on('auth_attempt', (data: AuthenticationAttempt) => {
    console.log('AUTH_ATTEMPT event emitted!')
    socket.broadcast.emit('auth_attempt', data)
  })
})

const nextApp: next.Server = next({ dev: process.env.NODE_ENV !== 'production' })
const handler = nextApp.getRequestHandler()
nextApp
  .prepare()
  .then(() => {
    expressApp.get('/auth/discord', passport.authenticate('oauth2'))

    expressApp.get(
      '/auth/discord/callback',
      passport.authenticate('oauth2', {
        failureRedirect: '/auth/complete?ref=discord&status=fail'
      }),
      (_req: express.Request, res: express.Response) => {
        res.redirect('/auth/complete?ref=discord&status=success')
      }
    )

    expressApp.get('/auth/complete', (req: express.Request, res: express.Response) => {
      const { ref, status } = req.query
      io.sockets.emit('auth_attempt', { success: status === 'success', provider: ref })
      res.send('You can now close this tab.')
    })

    expressApp.get('*', (req: express.Request, res: express.Response) => {
      handler(req, res)
    })

    server.listen(expressApp.get('port'), (err: any) => {
      if (err) throw err
      console.log(`Listening on :${expressApp.get('port')}`)
    })
  })
  .catch(console.error)
