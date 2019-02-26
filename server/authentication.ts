import * as OAuth2Strategy from 'passport-oauth2'
import fetch from 'node-fetch'

const oauth2Options: OAuth2Strategy.StrategyOptions = {
  clientID: process.env.DISCORD_CLIENT_ID as string,
  clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
  authorizationURL: 'https://discordapp.com/api/oauth2/authorize',
  tokenURL: 'https://discordapp.com/api/oauth2/token',
  callbackURL: 'https://uo-auth-test.localtunnel.me/auth/discord/callback',
  scope: ['identify', 'email']
}

async function verifyDiscord(accessToken: string, _refreshToken: string, profile: any, done: any) {
  const res = await fetch(
    `${process.env.FORUMS_API_BASE}/core/members&email=${encodeURIComponent(profile.email)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.FORUMS_API_KEY}:`).toString('base64')}`
      }
    }
  )
  const resJson = await res.json()
  console.log(resJson)

  done(null, resJson.results[0])
}

export default {
  OAuth2: new OAuth2Strategy(oauth2Options, verifyDiscord)
}
