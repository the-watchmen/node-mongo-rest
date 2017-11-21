import _ from 'lodash'
import debug from 'debug'
import {constants} from '@watchmen/mongo-data'
import {stringify, VALIDATION_ERROR, UNIQUENESS_ERROR} from '@watchmen/helpr'

const dbg = debug('lib:mongo-rest:helper')
const mongoError = 'MongoError'

export function dbgreq(dbg, req) {
  dbg(
    '[%s]%s: params=%o, query=%o, body=%o, user=%o',
    req.method,
    req.path,
    req.params,
    req.query,
    req.body,
    req.user
  )
}

export function combine(req) {
  const params = _.transform(req.params, (result, value, key) => {
    const _key = key === constants.ID_FIELD ? key : _.replace(key, '_', '.')
    return (result[_key] = value) // eslint-disable-line no-return-assign
  })

  return {
    ...req.query,
    ...params
  }
}

export function forward({req, res, next, router, id}) {
  req.url = id ? `/${id}` : '/'
  req.query = combine(req)
  router(req, res, next)
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
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
}
