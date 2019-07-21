import debug from '@watchmen/debug'
import {defineSupportCode} from 'cucumber'
import {initState} from '@watchmen/test-helpr'
import {getDb} from '@watchmen/mongo-helpr'
import {initDb} from '@watchmen/mongo-test-helpr'

const dbg = debug(__filename)
dbg('loaded hooks')

// eslint-disable-next-line no-unused-expressions
require('../../server').default

defineSupportCode(({Before}) => {
	Before(async function() {
		try {
			dbg('before: this=%j', this)
			initState()
			const db = await getDb()
			const result = await initDb(db)
			dbg('before: init-db result=%o', result)
		} catch (error) {
			dbg('before: caught=%o', error)
			throw error
		}
	})
})
