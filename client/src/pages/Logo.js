import React from 'react'

import { Link } from 'react-router-dom'
import logo from 'img/logo.png'

export default function Logo({ match }) {
	return (
		<Link to="/">
			<img src={logo} alt="" />
		</Link>
	)
}
