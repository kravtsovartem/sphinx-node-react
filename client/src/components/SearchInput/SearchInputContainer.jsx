import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchSuggestionsRequest, updateInputValue } from 'store/SearchInput/actions'
import { fetchRequestResults } from 'store/SearchListItems/actions'
import SearchInput from './SearchInput'

function SearchInputContainer(props) {
	return <SearchInput model={props} />
}

function mapStateToProps(state) {
	return {
		...state.searchInput,
		...state.searchListItems,
		routerLocationSearch: state.router.location.search,
		router: state.router,
	}
}

const mapDispatchToProps = dispatch =>
	bindActionCreators({ fetchSuggestionsRequest, fetchRequestResults, updateInputValue }, dispatch)

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchInputContainer)
