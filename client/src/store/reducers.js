import { combineEpics } from 'redux-observable'
import { combineReducers } from 'redux'

import { connectRouter } from 'connected-react-router'

import searchInputReducer from './SearchInput/reducers'
import searchListItemsReducer from './SearchListItems/reducers'

import { fetchResultsEpic } from './SearchListItems/actions'
import { fetchSuggestionsEpic } from './SearchInput/actions'
import { fetchItemEpic } from './Item/actions'

import ItemReducer from './Item/reducers'

export default history =>
	combineReducers({
		router: connectRouter(history),
		searchInput: searchInputReducer,
		searchListItems: searchListItemsReducer,
		item: ItemReducer,
	})

export const rootEpic = combineEpics(fetchSuggestionsEpic, fetchResultsEpic, fetchItemEpic)
