import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import searchInputReducer from './SearchInput/reducers'
import searchListItemsReducer from './SearchListItems/reducers'
import item from './Item/reducers'

export default history =>
	combineReducers({
		router: connectRouter(history),
		searchInput: searchInputReducer,
		searchListItems: searchListItemsReducer,
		item,
	})
