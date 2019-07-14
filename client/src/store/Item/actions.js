export function fetchItem(value) {
	let time = new Date().getTime()
	return (dispatch, getState) => {
		const currentItem = getState().searchListItems.data.find(elem => {
			return elem.uid === value
		})

		// Документ уже существует в store.
		if (currentItem !== undefined) {
			dispatch(updateItem(currentItem))
			return
		}

		const freezeLoader = setTimeout(() => {
			dispatch(requestItem())
		}, 300)

		fetch('/item', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ value }),
		})
			.then(response => response.json())
			.then(json => {
				clearTimeout(freezeLoader)
				time = new Date().getTime() - time
				// console.warn('fetchItem -> Время запроса: ', `${time} мc.`)

				const { data } = json

				return dispatch(updateItem(data))
			})
	}
}

export const REQUEST_ITEM = 'REQUEST_ITEM'
export function requestItem() {
	return {
		type: REQUEST_ITEM,
	}
}

export const UPDATE_ITEM = 'UPDATE_ITEM'
export function updateItem(data) {
	return {
		type: UPDATE_ITEM,
		...data,
	}
}
