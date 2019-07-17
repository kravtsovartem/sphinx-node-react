import React from 'react'
import { connect } from 'react-redux'

import { fetchRequestResults, storeChangePage } from 'store/SearchListItems/actions'
import { bindActionCreators } from 'redux'
import SearchList from './SearchList'

function SearchBarContainer(props) {
	return <SearchList model={props} />
}

function mapStateToProps(state) {
	return {
		...state.searchListItems,
		...state.searchInput,
	}
}

const mapDispatchToProps = dispatch =>
	bindActionCreators({ fetchRequestResults, storeChangePage }, dispatch)

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchBarContainer)
