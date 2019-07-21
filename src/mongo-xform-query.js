import assert from 'assert'
import debug from '@watchmen/debug'
import _ from 'lodash'
import {parseParam, oid, pushOrs, ensureAnd} from '@watchmen/mongo-helpr'
import {parseValue} from '@watchmen/helpr'
import {isIdField} from '@watchmen/mongo-data'
import geocode from '@watchmen/geocodr'

const dbg = debug(__filename)

const orRegex = /^_or\((.+)\)$/
const operatorRegex = /^_(.+):(.+)$/
const nearAddress = 'nearAddress'

export const orMatcher = {
	isMatch: ({key}) => {
		return orRegex.test(key)
	},
	xform: ({result, key, value, parse}) => {
		const match = orRegex.exec(key)
		assert(match, 'match required')
		const targets = match[1].split(',')
		assert(targets.length > 0, `unexpected key=${key}`)
		const ors = targets.map(elt => {
			return {[elt.trim()]: parseMongoValue({value, parse})}
		})
		result = pushOrs({query: result, ors})
		delete result[key]
		return result
	}
}

export const oidMatcher = {
	isMatch: ({key}) => {
		return isIdField(key)
	},
	xform: ({result, key, value}) => {
		result[key] = oid({value})
		return result
	}
}

export const operatorMatcher = {
	isMatch: ({value}) => {
		return Array.isArray(value)
			? _.some(value, elt => operatorRegex.test(elt))
			: operatorRegex.test(value)
	},
	xform: ({result, key, value, parse}) => {
		if (Array.isArray(value)) {
			const andElts = value.map(andElt => {
				const match = parseOperator({value: andElt, parse})
				return {[key]: match || parseMongoValue({value: andElt, parse})}
			})
			result = ensureAnd(result)
			_.each(andElts, andElt => result.$and.push(andElt))
			// eg: foo=[_bar:baz, _bip:bop, 3] --> {$and: [{foo: {$bar: baz}, {foo: {$bip: bop}}, {foo: 3}]}
			delete result[key]
			return result
		}

		// eg: foo=_bar:baz --> foo={$bar: baz}
		const match = parseOperator({value, parse})
		assert(match, 'match required')
		result[key] = match
		return result
	}
}

function parseOperator({value, parse}) {
	if (operatorRegex.test(value)) {
		const match = operatorRegex.exec(value)
		const operator = match[1]
		const _value = match[2]
		dbg('operator-matcher: value=%o, operator=%o, _value=%o', value, operator, _value)
		// eg: _bar:baz --> {$bar: baz}
		return {[`$${operator}`]: parseMongoValue({value: _value, parse})}
	}

	return false
}

function parseMongoValue({value, parse}) {
	return parseParam(parse ? parseValue(value) : value)
}

export function getNearAddressMatcher({geoProvider}) {
	return {
		isMatch: ({key}) => {
			return key === nearAddress
		},
		xform: async ({result, key, value}) => {
			// let coordinates = isZip5(value) && (await getZipCoordinates(value))
			// if (!coordinates) {
			//   coordinates = await geocode(value, geoProvider)
			// }
			const coordinates = await geocode(value, geoProvider)
			result.nearLon = coordinates[0]
			result.nearLat = coordinates[1]
			delete result[key]
			return result
		}
	}
}
