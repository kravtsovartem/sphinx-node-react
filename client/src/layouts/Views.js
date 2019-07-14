import React from 'react'
import { Route } from 'react-router-dom'

import SearchPage from 'pages/SearchPage'
import ItemPage from 'pages/ItemPage'

export default function Views(props) {
	return (
		<div>
			<Route path="/" component={SearchPage} />
			<Route path="/item/:id" component={ItemPage} />
		</div>
	)
}
