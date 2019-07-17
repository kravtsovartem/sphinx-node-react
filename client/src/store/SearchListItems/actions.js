import { ajax } from 'rxjs/ajax'
import {
	catchError,
	map,
	switchMap,
	debounce,
	distinctUntilChanged,
	debounceTime,
	retryWhen,
	zip,
	mergeMap,
	flatMap,
	filter,
} from 'rxjs/operators'

import { of, range, timer, Observable, pipe } from 'rxjs'
import { ofType } from 'redux-observable'
import { push } from 'connected-react-router'

export const REQUEST_RESULTS = 'REQUEST_RESULTS'
export const REQUEST_CHANGE_PAGE_RESULTS = 'REQUEST_CHANGE_PAGE_RESULTS'
export const UPDATE_RESULTS = 'UPDATE_RESULTS'

export const updateResults = payload => {
	return { type: UPDATE_RESULTS, ...payload }
}

export const fetchResultsEpic = (action$, state$) =>
	action$.pipe(
		ofType(REQUEST_RESULTS),
		debounceTime(300),
		distinctUntilChanged(),
		switchMap(action => {
			let time = new Date().getTime()
			const state = state$.value
			const { page, limit, lastValue } = state.searchListItems
			const { value } = state.searchInput

			if (value === lastValue) return of(updateResults())

			return ajax({
				url: '/search',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ value, page, limit }),
			}).pipe(
				map(res => {
					time = (new Date().getTime() - time) / 1000
					// console.warn('fetchResults -> Время запроса: ', `${time} c.`)

					const { data } = res.response

					const items = Object.prototype.hasOwnProperty.call(data, 'matches')
						? data.matches.map(child => child.attrs)
						: []

					const pageCount = Math.ceil(data.total / limit)
					const countResults = data.total

					const payload = {
						data: items,
						pageCount,
						countResults,
						timeRequest: time,
						lastValue: value,
						lastPage: page,
					}

					return updateResults(payload)
				}),

				retryWhen(err => {
					return err.pipe(
						zip(range(1, 5), err, (e, i) => {
							return i
						}),
						flatMap(i => {
							return timer(i * 1000)
						}),
					)
				}),
			)
		}),
	)

export function storeChangePage(page) {
	return {
		type: REQUEST_CHANGE_PAGE_RESULTS,
		page,
	}
}

export const fetchRequestResults = payload => {
	return {
		type: REQUEST_RESULTS,
		payload,
	}
}
