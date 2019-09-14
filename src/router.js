import express from 'express'
import debug from '@watchmen/debug'
import _ from 'lodash'
import {parseBoolean, deepClean} from '@watchmen/helpr'
import {getData, getName, xformQuery, constants} from '@watchmen/mongo-data'
import {dbgreq} from './helper'
import {operatorMatcher} from './mongo-xform-query'

export function getHandlers(opts) {
	const dbg = debug(__filename, {tag: getName(opts)})
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
		} catch (error) {
			next(error)
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
		} catch (error) {
			next(error)
		}
	}

	return {
		index: async (req, res, next) => {
			_index({req, res, next, query: req.query})
		},

		indexPost: async (req, res, next) => {
			_index({req, res, next, query: req.body})
		},

		meta: async (req, res, next) => {
			_meta({req, res, next, query: req.query})
		},

		metaPost: async (req, res, next) => {
			_meta({req, res, next, query: req.body})
		},

		get: async (req, res, next) => {
			try {
				dbgreq(dbg, req)
				const id = await getId({id: req.params.id, context: getContext(req), opts})
				const result = await data.get(id)
				result ? res.send(result) : res.status(404).send('not found')
			} catch (error) {
				next(error)
			}
		},

		post: async (req, res, next) => {
			try {
				dbgreq(dbg, req)
				const result = await data.create({data: req.body, context: getContext(req)})
				res.set('Location', `${req.originalUrl}/${result.insertedId}`)
				res.status(201).send('created')
			} catch (error) {
				next(error)
			}
		},

		put: async (req, res, next) => {
			try {
				dbgreq(dbg, req)
				const id = await getId({id: req.params.id, context: getContext(req), opts})
				const result = await data.update({id, data: req.body, context: getContext(req)})
				result ? res.status(204).send('updated') : res.status(404).send('not found')
			} catch (error) {
				next(error)
			}
		},

		delete: async (req, res, next) => {
			try {
				dbgreq(dbg, req)
				const id = await getId({id: req.params.id, context: getContext(req), opts})
				const result = await data.delete({id, context: getContext(req)})
				result ? res.status(204).send('deleted') : res.status(404).send('not found')
			} catch (error) {
				next(error)
			}
		}
	}
}

export default function(opts) {
	const router = opts.router || express.Router()
	const handlers = getHandlers(opts)

	router.get('/', async (req, res, next) => handlers.index(req, res, next))
	router.post('/search', async (req, res, next) => handlers.indexPost(req, res, next))
	router.get('/meta', async (req, res, next) => handlers.meta(req, res, next))
	router.post('/meta', async (req, res, next) => handlers.metaPost(req, res, next))
	router.get('/:id', async (req, res, next) => handlers.get(req, res, next))
	router.post('/', async (req, res, next) => handlers.post(req, res, next))
	router.put('/:id', async (req, res, next) => handlers.put(req, res, next))
	router.delete('/:id', async (req, res, next) => handlers.delete(req, res, next))

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
	return opts.idQueryHook ? opts.idQueryHook({query, context}) : query
}

function getUserContext(req) {
	return deepClean({user: req.user, standardUser: req.standardUser}) || {}
}

function getContext(req) {
	return {...req.query, ...getUserContext(req)}
}
