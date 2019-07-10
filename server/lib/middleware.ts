import { readFileSync } from 'fs'
import { Request, Response, NextFunction } from 'express'
import { resolve } from 'path'
import { parse } from 'yaml'

const apiKeys: { keys: { app: string; key: string }[] } = parse(
  readFileSync(resolve(__dirname, '../../keys/api-keys.yaml'), 'utf8')
)

/**
 * Route middleware to validate the API key provided in the
 * 'X-API-KEY' header against the list of approved keys
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function validateAPIKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-api-key'] as string
  for (const k of apiKeys.keys) {
    if (k.key === key) {
      next()
      return
    }
  }
  res.status(403).json({ error: 'invalid or missing API key in headers.' })
}
