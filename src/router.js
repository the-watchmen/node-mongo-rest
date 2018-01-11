import express from 'express'
import debug from '@watchmen/debug'
import _ from 'lodash'
import {parseBoolean, deepClean} from '@watchmen/helpr'
import {getData, getName, xformQuery, constants} from '@watchmen/mongo-data'
import {dbgreq} from './helper'
import {operatorMatcher} from './mongo-xform-query'

export default function(opts) {
  const dbg = debug(__filename, {tag: getName(opts)})
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
      const id = await getId({id: req.params.id, context: getContext(req), opts})
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
      const id = await getId({id: req.params.id, context: getContext(req), opts})
      const result = await data.update({id, data: req.body, context: getContext(req)})
      result ? res.status(204).send('updated') : res.status(404).send('not found')
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      dbgreq(dbg, req)
      const id = await getId({id: req.params.id, context: getContext(req), opts})
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
    omitKeys: _.union(opts.omitKeys, ['includeCount']),
    matchers: [...(opts.matchers || []), operatorMatcher]
  })
}

async function getId({id, context, opts}) {
  const query = await getQuery({query: {[constants.ID_FIELD]: id}, opts})
  return opts.idQueryHook ? await opts.idQueryHook({query, context}) : query
}

function getUserContext(req) {
  return deepClean({user: req.user, standardUser: req.standardUser})
}

function getContext(req) {
  return {...req.query, ...getUserContext(req)}
}
