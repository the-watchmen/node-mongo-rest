import joi from 'joi'
import {joiValidator} from '@watchmen/mongo-data'

const validate = joiValidator({
	schema: joi.object({
		_id: joi.string(),
		name: joi
			.string()
			.min(2)
			.max(128)
	}),
	createModifier: schema => schema.requiredKeys('name')
})

export default async function({data, mode}) {
	return validate({mode, data})
}
