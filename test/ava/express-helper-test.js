import test from 'ava'
import {combine} from '../../src/express-helper'

test('combine', t => {
  const result = combine({
    // eslint-disable-next-line camelcase
    params: {_id: 1, a_b: 2},
    query: {c: 2}
  })
  t.deepEqual(result, {_id: 1, 'a.b': 2, c: 2})
})
