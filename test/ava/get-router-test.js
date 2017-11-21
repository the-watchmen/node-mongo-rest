import test from 'ava'
import {nominatim as geoProvider} from '@watchmen/geocodr'
import {getQuery} from '../../src/router'
import {getNearAddressMatcher} from '../../src/mongo-xform-query'

test('getQuery', async t => {
  const result = await getQuery({
    query: {
      nearAddress: 'Hartford, CT 06108',
      includeCount: 'true',
      _id: '1',
      'source._id': '1',
      'identifiers.extension': '1',
      id: '1'
    },
    opts: {matchers: [getNearAddressMatcher({geoProvider})]}
  })
  t.truthy(result)
  t.is(result.nearAddress, undefined)
  t.truthy(result.nearLat)
  t.truthy(result.nearLon)
  t.is(result.includeCount, undefined)
  t.is(result._id, '1')
  t.is(result['source._id'], '1')
  t.is(result['identifiers.extension'], '1')
  t.is(result.id, 1)
})
