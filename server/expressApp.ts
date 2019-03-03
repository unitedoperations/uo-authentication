import * as express from 'express'
import * as session from 'express-session'
import * as helmet from 'helmet'
import * as compression from 'compression'
import * as morgan from 'morgan'
import * as passport from 'passport'

const app: express.Express = express()
app.set('port', process.env.PORT || 8080)
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  // TODO: Update to use secure cookies
  session({
    secret: process.env.DISCORD_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passport.initialize())
app.use(passport.session())

export default app
