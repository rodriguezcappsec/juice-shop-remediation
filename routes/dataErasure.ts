/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import express, { type NextFunction, type Request, type Response } from 'express'
import path from 'path'
import { UserModel } from '../models/user'
import { SecurityQuestionModel } from '../models/securityQuestion'
import { PrivacyRequestModel } from '../models/privacyRequests'
import { challenges } from '../data/datacache'
const insecurity = require('../lib/insecurity')

const challengeUtils = require('../lib/challengeUtils')
const router = express.Router()

interface DataErasureRequestParams {
  layout?: string
  email: string
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', async (req: Request<Record<string, unknown>, Record<string, unknown>, DataErasureRequestParams>, res: Response, next: NextFunction): Promise<void> => {
  const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
  if (!loggedInUser) {
    next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
    return
  }

  try {
    await PrivacyRequestModel.create({
      UserId: loggedInUser.data.id,
      deletionRequested: true
    })

    res.clearCookie('token')
    if (req.body.layout) {
      const filePath: string = path.resolve(req.body.layout).toLowerCase()
      const isForbiddenFile: boolean = (filePath.includes('ftp') || filePath.includes('ctf.key') || filePath.includes('encryptionkeys'))
      if (!isForbiddenFile) {
        res.render('dataErasureResult', {
          ...req.body
        }, (error, html) => {
          if (!html || error) {
            next(new Error(error.message))
          } else {
            const sendlfrResponse: string = html.slice(0, 100) + '......'
            res.send(sendlfrResponse)
            challengeUtils.solveIf(challenges.lfrChallenge, () => { return true })
          }
        })
      } else {
        next(new Error('File access not allowed'))
      }
    } else {
      res.render('dataErasureResult', {
        ...req.body
      })
    }
  } catch (error) {
    next(error)
  }
})

export default router
