import React, { useState } from 'react'

import { Link } from 'react-router-dom'

const style = {
	item: {
		paddingBottom: '26px',
	},
	name: {
		lineHeight: '0.2',
		fontSize: '18px',
		color: '#1a0dab',
	},
	text: {
		color: '#545454',
	},
	linkLeave: {
		textDecoration: 'none',
	},
	linkHover: {
		textDecoration: 'underline',
	},
}

export default function SearchItem(props) {
	const { model } = props
	const [hover, setHover] = useState(false)

	const rawMarkup = () => {
		let desc = model.highlight.trim()
		desc = desc.length > 0 ? desc : 'Описание отсутствует.'
		return { __html: desc }
	}

	const toggleHover = () => {
		setHover(!hover)
	}

	const getStyleLink = () => {
		return hover ? style.linkHover : style.linkLeave
	}

	return (
		<div style={style.item}>
			<Link
				style={getStyleLink()}
				onMouseEnter={toggleHover}
				onMouseLeave={toggleHover}
				to={`/item/${model.uid}`}
			>
				<h3 style={style.name}>{model.name}</h3>
			</Link>
			<div>{`/item/${model.uid}`}</div>

			<span style={style.text} dangerouslySetInnerHTML={rawMarkup()} />
		</div>
	)
}
