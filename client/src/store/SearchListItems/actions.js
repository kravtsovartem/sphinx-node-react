export const REQUEST_RESULTS = 'REQUEST_RESULTS'
export const REQUEST_CHANGE_PAGE_RESULTS = 'REQUEST_CHANGE_PAGE_RESULTS'
export const UPDATE_RESULTS = 'UPDATE_RESULTS'

export function fetchResults({ value = '', page = 1, limit = 5 }) {
	let time = new Date().getTime()
	return (dispatch, getStore) => {
		const store = getStore().searchListItems
		// Запрос не поменялся.
		if (store.lastValue === value && page === store.lastPage) return

		const freezeLoader = setTimeout(() => {
			dispatch(requestResults(value))
		}, 300)

		fetch('/search', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ value, page, limit }),
		})
			.then(response => response.json())
			.then(json => {
				clearTimeout(freezeLoader)

				time = (new Date().getTime() - time) / 1000
				// console.warn('fetchResults -> Время запроса: ', `${time} c.`)

				const { data } = json

				const items = Object.prototype.hasOwnProperty.call(data, 'matches')
					? json.data.matches.map(child => child.attrs)
					: []

				const pageCount = Math.ceil(data.total / limit)
				const countResults = data.total

				return dispatch(
					updateResults({
						data: items,
						pageCount,
						countResults,
						timeRequest: time,
						lastValue: value,
						lastPage: page,
					}),
				)
			})
	}
}

export function changePage(page) {
	return {
		type: REQUEST_CHANGE_PAGE_RESULTS,
		page,
	}
}

export function requestResults(value) {
	return {
		type: REQUEST_RESULTS,
	}
}

export function updateResults(data) {
	return {
		type: UPDATE_RESULTS,
		...data,
	}
}
