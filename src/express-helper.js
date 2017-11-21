import _ from 'lodash'
import {constants} from '@watchmen/mongo-data'

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
