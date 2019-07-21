import test from 'ava'
import {oid} from '@watchmen/mongo-helpr'
import {orMatcher, oidMatcher, operatorMatcher} from '../../src/mongo-xform-query'

test('orMatcher', t => {
	const key = '_or(foo,bar)'
	const value = 'baz'
	const match = orMatcher.isMatch({key})
	t.truthy(match)
	t.falsy(orMatcher.isMatch({key: 'not'}))
	t.deepEqual(
		orMatcher.xform({
			result: {[key]: value},
			key,
			value,
			match
		}),
		{
			$or: [{foo: 'baz'}, {bar: 'baz'}]
		}
	)
})

test('oidMatcher', t => {
	const key = '_id'
	const value = '123456789012'
	const match = oidMatcher.isMatch({key})
	t.truthy(match)
	t.deepEqual(
		oidMatcher.xform({
			result: {[key]: value},
			key,
			value,
			match
		}),
		{[key]: oid({value})}
	)
})

test('operatorMatcher: basic', t => {
	const key = 'foo'
	const value = `_bar:baz`
	const match = operatorMatcher.isMatch({key, value})
	t.truthy(match)
	t.deepEqual(
		operatorMatcher.xform({
			result: {[key]: value},
			key,
			value,
			match
		}),
		{foo: {$bar: 'baz'}}
	)
})

test('operatorMatcher: multi', t => {
	const key = 'foo'
	const value = ['_bar:baz', '_bim:bam']

	const match = operatorMatcher.isMatch({key, value})
	t.truthy(match)
	t.deepEqual(
		operatorMatcher.xform({
			result: {[key]: value},
			key,
			value,
			match
		}),
		{
			$and: [{foo: {$bar: 'baz'}}, {foo: {$bim: 'bam'}}]
		}
	)
})
