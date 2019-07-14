import React from 'react'
import { css } from 'emotion'

import SearchInputContainer from 'components/SearchInput/SearchInputContainer'

import { Link } from 'react-router-dom'
import logo from 'img/logo.png'

const stylePage = css`
	display: grid;
	justify-content: center;
	align-items: center;
	margin-top: 200px;
`

const styleSearch = css`
	width: 582px;
	padding: 10px 0;
`

export default function SearchPage(props) {
	return (
		<div className={stylePage}>
			<aside></aside>
			<main>
				<div
					className={css`
						text-align: center;
					`}
				>
					<Link to="/">
						<img src={logo} alt="" />
					</Link>
				</div>
				<div className={styleSearch}>
					<SearchInputContainer />
				</div>
			</main>
		</div>
	)
}
