/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { UserModel } from '../models/user'
import { SecurityQuestionModel } from '../models/securityQuestion'

module.exports = function securityQuestion () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const email = query.email
  }
}
