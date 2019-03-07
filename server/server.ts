import * as http from 'http'
import * as express from 'express'
import * as session from 'express-session'
import * as helmet from 'helmet'
import * as compression from 'compression'
import * as morgan from 'morgan'
import * as cors from 'cors'
import * as passport from 'passport'
import * as socketIO from 'socket.io'
import { nextHandler } from './nextApp'
import * as handlers from './handlers'
import { validateAPIKey } from './lib/middleware'

export type AuthenticationProvider = 'discord' | 'forums' | 'teamspeak'
export interface AuthenticationAttempt {
  success: boolean
  provider: AuthenticationProvider
  next: AuthenticationProvider | null
}

export const expressApp: express.Express = express()
expressApp.set('port', process.env.PORT || 8080)
expressApp.use(morgan('dev'))
expressApp.use(helmet())
expressApp.use(compression())
expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: false }))
expressApp.use(
  // TODO: Update to use secure cookies
  session({
    secret: process.env.DISCORD_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
expressApp.use(passport.initialize())
expressApp.use(passport.session())

passport.use(handlers.DiscordAuth)
passport.serializeUser((user: unknown, done: any) => {
  done(null, user)
})
passport.deserializeUser((user: unknown, done: any) => {
  done(null, user)
})

expressApp.get('/auth/discord', passport.authenticate('oauth2'))
expressApp.get(
  '/auth/discord/callback',
  passport.authenticate('oauth2', {
    failureRedirect: '/auth/complete?ref=discord&status=fail'
  }),
  (_req: express.Request, res: express.Response) => {
    res.redirect('/auth/auth/complete?ref=discord&status=success')
  }
)

expressApp.get('/auth/forums', handlers.verifyForums)
expressApp.get('/auth/teamspeak', handlers.verifyTeamspeak)
expressApp.get('/auth/complete', handlers.completeAuthProvider)
expressApp.post('/auth/save', handlers.saveAuthenticatedUser)
expressApp.get('/auth/token', cors(), validateAPIKey, handlers.issueToken)
expressApp.get('*', (req, res) => {
  nextHandler(req, res)
})

export const server: http.Server = new http.Server(expressApp)
export const io: socketIO.Server = socketIO(server, {
  serveClient: false
})

io.sockets.on('connection', _socket => {
  console.log('New socket connection!')
})
