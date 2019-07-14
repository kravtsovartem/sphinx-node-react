import React from 'react'
import { connect } from 'react-redux'

import { fetchResults, changePage } from 'store/SearchListItems/actions'
import SearchList from './SearchList'

function SearchBarContainer(props) {
	return <SearchList model={props} />
}

const mapStateToProps = state => {
	return {
		...state.searchListItems,
		value: state.searchInput.value,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		dispatchFetchSearch: data => dispatch(fetchResults(data)),
		dispatchChangePage: page => dispatch(changePage(page)),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchBarContainer)
