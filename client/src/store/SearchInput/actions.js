import { ajax } from 'rxjs/ajax'
import {
	catchError,
	map,
	switchMap,
	distinctUntilChanged,
	debounceTime,
	filter,
} from 'rxjs/operators'
import { of, range, timer } from 'rxjs'
import { ofType } from 'redux-observable'

export const LOAD_SUGGESTIONS_BEGIN = 'LOAD_SUGGESTIONS_BEGIN'
export const UPDATE_SUGGESTIONS = 'UPDATE_SUGGESTIONS'
export const CLEAR_SUGGESTIONS = 'CLEAR_SUGGESTIONS'
export const UPDATE_INPUT_VALUE = 'UPDATE_INPUT_VALUE'

export const fetchSuggestionsRequest = value => {
	return { type: LOAD_SUGGESTIONS_BEGIN, payload: { value, limit: 10 } }
}
export const fetchSuggestionsFulfilled = payload => {
	return { type: UPDATE_SUGGESTIONS, payload }
}

export const fetchSuggestionsEpic = (action$, state$) => {
	return action$.pipe(
		ofType(LOAD_SUGGESTIONS_BEGIN),
		filter(({ payload }) => {
			if (payload.value !== undefined && payload.value.trim().length > 0) return true

			return false
		}),
		debounceTime(300),
		distinctUntilChanged(),
		switchMap(action => {
			const { value, limit } = action.payload
			return ajax({
				url: '/search/suggest',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ value, limit }),
			}).pipe(
				map(res => fetchSuggestionsFulfilled(res.response.data)),
				catchError(ex => {
					return of(ex)
				}),
			)
		}),
	)
}

export function updateInputValue(value) {
	return (dispatch, getState) => {
		dispatch({
			type: UPDATE_INPUT_VALUE,
			value,
		})
	}
}
export function clearSuggestions() {
	return {
		type: CLEAR_SUGGESTIONS,
	}
}
