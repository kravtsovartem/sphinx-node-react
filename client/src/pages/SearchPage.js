import React from 'react'
import { css } from 'emotion'

import SearchInputContainer from 'components/SearchInput/SearchInputContainer'
import SearchListContainer from 'components/SearchList/SearchListContainer'

import { Link } from 'react-router-dom'
import logo from 'img/logo.png'

const style = css`
	display: grid;
	grid-template-columns: 0.4fr 750px 0.5fr;
`

export default function SearchPage(props) {
	return (
		<div className={style}>
			<aside>
				<Link to="/">
					<img src={logo} alt="" />
				</Link>
			</aside>
			<main>
				<SearchInputContainer />
				<div
					className={css`
						padding: 0 10px;
					`}
				>
					<SearchListContainer />
				</div>
			</main>
		</div>
	)
}
