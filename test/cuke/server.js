// eslint-disable-next-line import/no-unassigned-import
import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import debug from 'debug'
import config from 'config'
import jwt from 'express-jwt'
import {errorHandler} from '../../src/helper'
import widgetRouter from './widgets'

export default (function() {
  const dbg = debug('test:index')
  const app = express()

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: false}))

  process.on('unhandledRejection', err => {
    dbg('unhandled-rejection: %o', err)
    process.exit(1)
  })

  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', 'default-src "none"; connect-src "self" https:;')
    next()
  })

  app.use(
    jwt({secret: config.get('listener.secret'), credentialsRequired: false}),
    (req, res, next) => {
      const {user} = req
      if (user) {
        const _user = {_id: user.userId, name: user.userName}
        dbg('pre-user=%o, post-user=%o', req.user, _user)
        req.user = _user
      }
      next()
    }
  )

  app.get('/', (req, res) => {
    dbg('req.user=%o', req.user)
    res.send('api home...')
  })

  app.use('/widgets', widgetRouter)

  app.use(errorHandler)

  const port = config.get('listener.port')
  app.listen(port, () => {
    dbg('listening on port=%o', port)
  })
})()
