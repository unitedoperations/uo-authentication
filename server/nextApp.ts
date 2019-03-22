import * as next from 'next'

const app: next.Server = next({ dev: process.env.NODE_ENV !== 'production' })
export const nextHandler = app.getRequestHandler()

export default app
