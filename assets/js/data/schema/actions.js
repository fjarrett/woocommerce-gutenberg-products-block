/**
 * Internal dependencies
 */
import { ACTION_TYPES as types } from './action-types.js';

/**
 * Returns an action object used to update the store with the provided schema
 * for the provided model name.
 *
 * @param {string} modelName
 * @param {Object} schema
 *
 * @return {Object}  The action object.
 */
export function receiveSchemaForModel( modelName, schema = {} ) {
	return {
		type: types.RECEIVE_SCHEMA_RECORD,
		modelName,
		schema,
	};
}

/**
 * Returns an action object used to update the store with the provided list
 * of model endpoints.
 *
 * @param   {Object}  endpoints  An array of endpoints to add to the store state.
 *
 * @return  {Object}             The action object.
 */
export function receiveModelEndpoints( endpoints ) {
	return {
		type: types.RECEIVE_MODEL_ENDPOINTS,
		endpoints,
	};
}
