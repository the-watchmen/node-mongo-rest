import {
  createdDataHook as dataHook,
  changesPostUpdateHook as postUpdateHook,
  postDeleteHook
} from '@watchmen/mongo-data'
import debug from '@watchmen/debug'
import widgetValidator from './validator'

const dbg = debug(__filename)

dbg('hook=%o', postDeleteHook)

export default {
  collectionName: 'widgets',
  dataHook,
  isValid: widgetValidator,
  postUpdateHook,
  postDeleteHook
}
