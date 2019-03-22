require('dotenv').config()
import { server, expressApp } from './server'
import nextApp from './nextApp'

nextApp
  .prepare()
  .then(() => {
    server.listen(expressApp.get('port'), () => {
      console.log(`🚀 Listening on :${expressApp.get('port')}`)
    })
  })
  .catch(console.error)
