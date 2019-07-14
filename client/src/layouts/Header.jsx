import React from 'react'
import SearchBarContainer from 'components/SearchBar/SearchBarContainer'

const style = {
	display: 'grid',
	gridTemplateColumns: '190px 1fr',
}

export default function Header(props) {
	return (
		<div style={style}>
			<SearchBarContainer />
		</div>
	)
}
