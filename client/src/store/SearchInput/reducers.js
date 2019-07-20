import {
	UPDATE_INPUT_VALUE,
	CLEAR_SUGGESTIONS,
	LOAD_SUGGESTIONS_BEGIN,
	UPDATE_SUGGESTIONS,
} from './actions'

const initialState = {
	value: '',
	limit: 10,
	suggestions: [],
	isLoadingSuggest: false,
}

export default function reducer(state = initialState, action = {}) {
	console.log('action:', action.type)
	switch (action.type) {
		case UPDATE_INPUT_VALUE:
			return {
				...state,
				value: action.payload,
			}

		case CLEAR_SUGGESTIONS:
			return {
				...state,
				suggestions: [],
			}

		case LOAD_SUGGESTIONS_BEGIN:
			return {
				...state,
				...action.payload,
				isLoadingSuggest: true,
			}

		case UPDATE_SUGGESTIONS:
			return {
				...state,
				suggestions: action.payload,
				isLoadingSuggest: false,
			}

		default:
			return state
	}
}
