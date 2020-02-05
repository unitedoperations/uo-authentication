import next from 'next'
import Server from 'next/dist/next-server/server/next-server'

const app: Server = next({ dev: process.env.NODE_ENV !== 'production' })
export const nextHandler = app.getRequestHandler()

export default app
