import React from 'react'
import { Route } from 'react-router'

import { AnimatedSwitch, AnimatedRoute, spring } from 'react-router-transition'

import StartPage from 'pages/StartPage'
import SearchPage from 'pages/SearchPage'
import ItemPage from 'pages/ItemPage'

import SlideOut from 'components/SlideOut'
import ScrollToTop from 'components/ScrollToTop'

const renderRoutes = () => {
	return (
		<React.Fragment>
			<ScrollToTop />
			<SlideOut mode="LEFT">
				<Route path="/item/:id" component={ItemPage} />
				<Route path="/search" component={SearchPage} />
				<Route path="/" component={StartPage} />
			</SlideOut>
		</React.Fragment>
	)
}

export default function routes(props) {
	console.log('props :', props)

	return <div>{renderRoutes()}</div>
}
