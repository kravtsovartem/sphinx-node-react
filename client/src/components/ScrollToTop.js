import React, { useEffect } from 'react'
import { withRouter } from 'react-router'

const ScrollToTop = ({ children, location: { pathname } }) => {
	useEffect(() => {
		console.log('pathname :', pathname)
		window.scrollTo(0, 0)
	}, [pathname])

	return <div></div>
}

export default withRouter(ScrollToTop)
