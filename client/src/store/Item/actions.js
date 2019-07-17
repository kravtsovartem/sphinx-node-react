import { ajax } from 'rxjs/ajax'
import {
	map,
	switchMap,
	debounce,
	distinctUntilChanged,
	debounceTime,
	retryWhen,
	zip,
	mergeMap,
	flatMap,
} from 'rxjs/operators'

import { of, range, timer, Observable, pipe } from 'rxjs'
import { ofType } from 'redux-observable'

export const REQUEST_ITEM = 'REQUEST_ITEM'
export const UPDATE_ITEM = 'UPDATE_ITEM'

export const fetchItemEpic = (action$, state$) =>
	action$.pipe(
		ofType(REQUEST_ITEM),
		switchMap(action => {
			const state = state$.value
			const value = action.payload

			const currentItem = state.searchListItems.data.find(elem => {
				return elem.uid === value
			})

			// Документ уже существует в store.
			if (currentItem !== undefined) {
				return of(updateItem(currentItem))
			}

			return ajax({
				url: '/item',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ value }),
			}).pipe(
				map(res => {
					const { data } = res.response

					return updateItem(data)
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

export function requestItem(payload) {
	return {
		type: REQUEST_ITEM,
		payload,
	}
}

export function updateItem(payload) {
	return {
		type: UPDATE_ITEM,
		...payload,
	}
}
