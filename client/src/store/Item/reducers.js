import { REQUEST_ITEM, UPDATE_ITEM } from './actions'

const initialState = {
	name: '',
	text: '',
	uid: '',
	isLoading: false,
}

export default function reducer(state = initialState, action = {}) {
	switch (action.type) {
		case REQUEST_ITEM:
			return {
				...state,
				isLoading: true,
			}

		case UPDATE_ITEM:
			return {
				...state,
				...action,
				isLoading: false,
			}

		default:
			return state
	}
}
