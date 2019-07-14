import React from 'react'
import { connect } from 'react-redux'

import { updateInputValue, loadSuggestions, clearSuggestions } from 'store/SearchInput/actions'
import SearchInput from './SearchInput'

function SearchInputContainer(props) {
	return <SearchInput model={props} />
}

function mapStateToProps(state) {
	const { value, suggestions, isLoading } = state.searchInput
	const { data, countResults, timeRequest, page } = state.searchListItems

	return {
		value,
		suggestions,
		isLoading,
		data,
		countResults,
		timeRequest,
		page,
		routerLocationSearch: state.router.location.search,
	}
}

function mapDispatchToProps(dispatch, ownProps) {
	return {
		onChange(newValue) {
			dispatch(updateInputValue(newValue))
		},
		onSuggestionsFetchRequested({ value }) {
			dispatch(loadSuggestions(value))
		},
		onSuggestionsClearRequested() {
			dispatch(clearSuggestions())
		},
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchInputContainer)
