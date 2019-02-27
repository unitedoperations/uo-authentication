require('dotenv').config()
import * as next from 'next'
import * as express from 'express'
import * as helmet from 'helmet'
import * as compression from 'compression'
import * as morgan from 'morgan'
import * as passport from 'passport'
import { DiscordAuth } from './authentication'

const server: express.Express = express()
server.set('port', process.env.PORT || 8080)
server.use(morgan('dev'))
server.use(helmet())
server.use(compression())
server.use(express.json())
server.use(express.urlencoded({ extended: false }))
server.use(passport.initialize())
server.use(passport.session())

passport.use(DiscordAuth)
passport.serializeUser((user: unknown, done: any) => {
  console.log(`Serialize: ${JSON.stringify(user)}`)
  done(null, user)
})
passport.deserializeUser((user: unknown, done: any) => {
  console.log(`Deserialize: ${JSON.stringify(user)}`)
  done(null, user)
})

const app: next.Server = next({ dev: process.env.NODE_ENV !== 'production' })
const handler = app.getRequestHandler()
app
  .prepare()
  .then(() => {
    server.get('/auth/discord', passport.authenticate('oauth2'))
    server.get(
      '/auth/discord/callback',
      passport.authenticate('oauth2', { failureRedirect: '/' }),
      (_req: express.Request, res: express.Response) => {
        res.redirect('/')
      }
    )

    server.get('*', (req: express.Request, res: express.Response) => {
      handler(req, res)
    })

    server.listen(server.get('port'), () => {
      console.log(`Listening on :${server.get('port')}`)
    })
  })
  .catch(console.error)
