require('dotenv').config()
import * as next from 'next'
import * as express from 'express'
import * as helmet from 'helmet'
import * as compression from 'compression'
import * as passport from 'passport'
import authStrategies from './authentication'

const server: express.Express = express()
server.set('port', process.env.PORT || 8080)
server.use(helmet())
server.use(compression())
server.use(express.json())
server.use(express.urlencoded({ extended: false }))
server.use(passport.initialize())

passport.use(authStrategies.OAuth2)

const app: next.Server = next({ dev: process.env.NODE_ENV !== 'production' })
const handler = app.getRequestHandler()
app
  .prepare()
  .then(() => {
    server.get('/auth/discord', passport.authenticate('oauth2'))
    server.get('/auth/discord/callback', passport.authenticate('oauth2', { failureRedirect: '/' }))

    server.get('*', (req, res) => {
      handler(req, res)
    })

    server.listen(server.get('port'), () => {
      console.log(`Listening on :${server.get('port')}`)
    })
  })
  .catch(console.error)
