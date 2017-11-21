import express from 'express'
import debug from 'debug'
import _ from 'lodash'
import {parseBoolean} from '@watchmen/helpr'
import {getData, getName, isIdField, constants, xformQuery} from '@watchmen/mongo-data'
import {dbgreq} from './helper'
import {operatorMatcher} from './mongo-xform-query'

export default function(opts) {
  const dbg = debug(`lib:mongo-rest:get-router(${getName(opts)})`)
  const router = opts.router || express.Router()
  const data = getData(opts)

  async function _index({req, res, next, query}) {
    try {
      dbgreq(dbg, req)
      const _query = await getQuery({query, opts})
      const context = getUserContext(req)
      const index = data.index({query: _query, context})
      const promises = parseBoolean(query.includeCount)
        ? [index, data.meta({query: _query, context})]
        : [index]
      const results = await Promise.all(promises)
      res.set('x-total-count', _.get(results[1], 'count'))
      res.send(results[0])
    } catch (err) {
      next(err)
    }
  }

  async function _meta({req, res, next, query}) {
    try {
      dbgreq(dbg, req)
      const result = await data.meta({
        query: await getQuery({query, opts}),
        context: getUserContext(req)
      })
      res.send(result)
    } catch (err) {
      next(err)
    }
  }

  router.get('/', async (req, res, next) => {
    _index({req, res, next, query: req.query})
  })

  router.post('/search', async (req, res, next) => {
    _index({req, res, next, query: req.body})
  })

  router.get('/meta', async (req, res, next) => {
    _meta({req, res, next, query: req.query})
  })

  router.post('/meta', async (req, res, next) => {
    _meta({req, res, next, query: req.body})
  })

  router.get('/:id', async (req, res, next) => {
    try {
      dbgreq(dbg, req)
      const id = await getId({id: req.params.id, opts})
      const result = await data.get(id)
      result ? res.send(result) : res.status(404).send('not found')
    } catch (err) {
      next(err)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      dbgreq(dbg, req)
      const result = await data.create({data: req.body, context: getContext(req)})
      res.set('Location', `${req.originalUrl}/${result.insertedId}`)
      res.status(201).send('created')
    } catch (err) {
      next(err)
    }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      dbgreq(dbg, req)
      const id = await getId({id: req.params.id, opts})
      const result = await data.update({id, data: req.body, context: getContext(req)})
      result ? res.status(204).send('updated') : res.status(404).send('not found')
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      dbgreq(dbg, req)
      const id = await getId({id: req.params.id, opts})
      const result = await data.delete({id, context: getContext(req)})
      result ? res.status(204).send('deleted') : res.status(404).send('not found')
    } catch (err) {
      next(err)
    }
  })

  return router
}

export async function getQuery({query, opts = {}}) {
  return xformQuery(query, {
    ...opts,
    xforms: {
      ...opts.xforms
    },
    omitKeys: _.union(opts.omitKeys, ['includeCount']),
    blackList: _.union(opts.blackList, [
      ({key}) => isIdField(key),
      ({key}) => key.endsWith('.extension')
    ]),
    matchers: [...(opts.matchers || []), operatorMatcher]
  })
}

async function getId({id, opts}) {
  const query = await getQuery({query: {[constants.ID_FIELD]: id}, opts})
  const _id = query[constants.ID_FIELD]
  return _id
}

function getUserContext(req) {
  return req.user ? {user: req.user} : null
}

function getContext(req) {
  return {...req.query, ...getUserContext(req)}
}
