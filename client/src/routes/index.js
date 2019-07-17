import React from 'react'
import { Route } from 'react-router'

import StartPage from 'pages/StartPage'
import SearchPage from 'pages/SearchPage'
import ItemPage from 'pages/ItemPage'

import ScrollToTop from 'components/ScrollToTop'
import SlideRightToLeft from 'components/SlideRightToLeft'
import SlideLeftToRight from 'components/SlideLeftToRight'

const renderRoutes = () => {
	return (
		<React.Fragment>
			<ScrollToTop />
			<SlideLeftToRight>
				<Route exact path="/" component={StartPage} />
				<Route path="/item/:id" component={ItemPage} />
			</SlideLeftToRight>
			<SlideRightToLeft>
				<Route path="/search" component={SearchPage} />
			</SlideRightToLeft>
		</React.Fragment>
	)
}

export default function routes(props) {
	return <div>{renderRoutes()}</div>
}
