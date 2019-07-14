import { push } from 'connected-react-router'

// Подсказки.
export function loadSuggestions(value) {
	return (dispatch, getState) => {
		const state = getState()
		if (value === state.searchInput.value) return

		const limit = state.searchInput.limitSuggestions

		dispatch(loadSuggestionsBegin())

		fetch('/search/suggest', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ value, limit }),
		})
			.then(response => response.json())
			.then(json => dispatch(updateSuggestions(json.data, value)))
	}
}

export const UPDATE_INPUT_VALUE = 'UPDATE_INPUT_VALUE'
export function updateInputValue(value) {
	return (dispatch, getState) => {
		dispatch(push(value.trim().length > 0 ? `/search?q=${value}` : '/'))
		dispatch({
			type: UPDATE_INPUT_VALUE,
			value,
		})
	}
}

export const CLEAR_SUGGESTIONS = 'CLEAR_SUGGESTIONS'
export function clearSuggestions() {
	return {
		type: CLEAR_SUGGESTIONS,
	}
}

export const LOAD_SUGGESTIONS_BEGIN = 'LOAD_SUGGESTIONS_BEGIN'
export function loadSuggestionsBegin() {
	return {
		type: LOAD_SUGGESTIONS_BEGIN,
	}
}

export const UPDATE_SUGGESTIONS = 'UPDATE_SUGGESTIONS'
export function updateSuggestions(suggestions, value) {
	return {
		type: UPDATE_SUGGESTIONS,
		suggestions,
		value,
	}
}
