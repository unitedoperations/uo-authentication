import { readFileSync } from 'fs'
import { Request, Response, NextFunction } from 'express'
import { resolve } from 'path'

const apiKeys: string[] = readFileSync(resolve(__dirname, '../config/api-keys.txt'), 'utf8').split(
  '\n'
)

export function validateAPIKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-api-key'] as string
  if (apiKeys.includes(key)) next()
  else {
    res.status(403).json({ error: 'invalid or missing API key in headers.' })
  }
}
