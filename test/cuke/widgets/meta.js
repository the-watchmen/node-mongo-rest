import {
  createdDataHook as dataHook,
  changesPostUpdateHook as postUpdateHook,
  postDeleteHook
} from '@watchmen/mongo-data'
import debug from 'debug'
import widgetValidator from './validator'

const dbg = debug('test:widgets:meta')

dbg('hook=%o', postDeleteHook)

export default {
  collectionName: 'widgets',
  dataHook,
  isValid: widgetValidator,
  postUpdateHook,
  postDeleteHook
}
