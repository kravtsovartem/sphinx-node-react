import React from 'react'
import { connect } from 'react-redux'
import { fetchItem } from 'store/Item/actions'

import Item from './Item'

function SearchBarContainer(props) {
	return <Item model={props} />
}

const mapStateToProps = state => {
	return state.item
}

function mapDispatchToProps(dispatch) {
	return {
		fetchItem(newValue) {
			dispatch(fetchItem(newValue))
		},
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchBarContainer)
