// eslint-disable-next-line import/no-unassigned-import
import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import debug from 'debug'
import config from 'config'
import jwt from 'express-jwt'
import {stringify, VALIDATION_ERROR, UNIQUENESS_ERROR} from '@watchmen/helpr'
import widgetRouter from './widgets'

const mongoError = 'MongoError'

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

  app.use(jwt({secret: config.get('listener.secret'), credentialsRequired: false}))

  app.get('/', (req, res) => {
    dbg('req.user=%o', req.user)
    res.send('api home...')
  })

  app.use('/widgets', widgetRouter)

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    dbg('default error handler: err:\n%s', stringify(err))
    dbg('default error handler: stack:\n%s', err.stack)

    if (err.name === VALIDATION_ERROR || (err.name === mongoError && err.code === 121)) {
      res.status(422)
    } else if (err.name === UNIQUENESS_ERROR || (err.name === mongoError && err.code === 11000)) {
      res.status(409)
    } else {
      res.status(500)
    }

    res.send({
      name: err.name,
      message: err.message
    })
  })

  const port = config.get('listener.port')
  app.listen(port, () => {
    dbg('listening on port=%o', port)
  })
})()
