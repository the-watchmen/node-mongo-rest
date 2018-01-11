import test from 'ava'
import {combine, getStandardUser} from '../../src/helper'

test('combine', t => {
  const result = combine({
    // eslint-disable-next-line camelcase
    params: {_id: 1, a_b: 2},
    query: {c: 2}
  })
  t.deepEqual(result, {_id: 1, 'a.b': 2, c: 2})
})

test('getStandardUser', t => {
  t.deepEqual(
    getStandardUser({
      user: {
        preferred_username: 'a716948',
        family_name: 'kerz',
        given_name: 'tony',
        email: 'tony.kerz@hotmail.com'
      }
    }),
    {
      _id: 'a716948',
      name: {
        first: 'tony',
        last: 'kerz'
      },
      email: 'tony.kerz@hotmail.com'
    }
  )
})

test('getStandardUser: fail', t => {
  t.throws(() => {
    getStandardUser({
      user: {dont: 'have', the: 'right stuff'}
    })
  })
})
