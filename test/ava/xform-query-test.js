import test from 'ava'
import debug from 'debug'
import {stringify} from '@watchmen/helpr'
import {xformQuery} from '@watchmen/mongo-data'
import {orMatcher} from '../../src/mongo-xform-query'

const dbg = debug('test:xform-params')

test('xformQuery: or', async t => {
  const result = await xformQuery(
    {
      '_or(foo, bar)': 'baz'
    },
    {
      matchers: [orMatcher]
    }
  )
  dbg('xform-query: or: result=%s', stringify(result))
  t.deepEqual(result, {
    $or: [{foo: 'baz'}, {bar: 'baz'}]
  })
})

test('xformQuery: or multiple', async t => {
  const result = await xformQuery(
    {
      '_or(foo, bar)': 'baz',
      '_or(bing, bang)': 'boom'
    },
    {
      matchers: [orMatcher]
    }
  )
  dbg('xform-query: or: result=%s', stringify(result))
  t.deepEqual(result, {
    $or: [{foo: 'baz'}, {bar: 'baz'}],
    $and: [
      {
        $or: [{bing: 'boom'}, {bang: 'boom'}]
      }
    ]
  })
})
