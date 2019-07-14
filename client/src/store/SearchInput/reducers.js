import {
	UPDATE_INPUT_VALUE,
	CLEAR_SUGGESTIONS,
	LOAD_SUGGESTIONS_BEGIN,
	UPDATE_SUGGESTIONS,
} from './actions'

const initialState = {
	value: '',
	suggestions: [],
	limitSuggestions: 3,
	isLoading: false,
}

export default function reducer(state = initialState, action = {}) {
	switch (action.type) {
		case UPDATE_INPUT_VALUE:
			return {
				...state,
				value: action.value,
			}

		case CLEAR_SUGGESTIONS:
			return {
				...state,
				suggestions: [],
			}

		case LOAD_SUGGESTIONS_BEGIN:
			return {
				...state,
				isLoading: true,
			}

		case UPDATE_SUGGESTIONS:
			return {
				...state,
				suggestions: action.suggestions,
				isLoading: false,
			}

		default:
			return state
	}
}
