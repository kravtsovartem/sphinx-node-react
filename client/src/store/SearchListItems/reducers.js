import { REQUEST_RESULTS, REQUEST_CHANGE_PAGE_RESULTS, UPDATE_RESULTS } from './actions'

const initialState = {
	data: [],
	isLoading: false,
	page: 1,
	limit: 10,
	pageCount: 1,
	countResults: 0,
	timeRequest: 0,
	value: '',
	lastValue: null,
	lastPage: 1,
}

export default function reducer(state = initialState, action = {}) {
	switch (action.type) {
		case REQUEST_RESULTS:
			return {
				...state,
				isLoading: true,
			}
		case REQUEST_CHANGE_PAGE_RESULTS:
			return {
				...state,
				page: action.page,
			}

		case UPDATE_RESULTS:
			return {
				...state,
				...action,
				isLoading: false,
			}

		default:
			return state
	}
}
