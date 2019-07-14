import React, { useEffect } from 'react'

import ListLoader from 'components/Loaders/ListLoader'

import { css } from 'emotion'

import './style.css'

function renderHTML(text) {
	return <span dangerouslySetInnerHTML={{ __html: text }}></span>
}

export default function Item({ model }) {
	const { name, text, match, isLoading } = model

	useEffect(() => {
		model.fetchItem(match.params.id)
	}, [])

	const renderLoader = () => {
		return (
			<div
				className={css`
					text-align: center;
					margin-top: 20vh;
				`}
			>
				{ListLoader()}
			</div>
		)
	}

	return (
		<div>
			{isLoading && renderLoader()}
			<p>{renderHTML(text)}</p>
		</div>
	)
}
