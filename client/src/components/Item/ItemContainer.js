import React from 'react'
import { connect } from 'react-redux'
import { requestItem } from 'store/Item/actions'

import { bindActionCreators } from 'redux'
import Item from './Item'

function SearchBarContainer(props) {
	return <Item model={props} />
}

const mapStateToProps = state => {
	return state.item
}

const mapDispatchToProps = dispatch => {
	return bindActionCreators({ requestItem }, dispatch)
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchBarContainer)
