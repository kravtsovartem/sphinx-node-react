import React, { useEffect } from 'react'

import SearchItem from 'components/SearchList/SearchItem'
import Paginations from 'components/Paginations'
import ListLoader from 'components/Loaders/ListLoader'

import { css } from 'emotion'

function renderEmpty(value) {
	const desc = `По запросу <strong>${value}</strong> ничего не найдено.`
	return <span dangerouslySetInnerHTML={{ __html: desc }} />
}

const renderStatResult = ({ countResults, timeRequest, page }) => {
	const isResult = countResults > 0
	if (!isResult) return ''

	const styleTime = {
		color: '#777',
		padding: '5px 0 ',
	}

	const textPage = page > 1 ? `, страница ${page}` : ''

	return (
		<div style={styleTime}>
			Результатов: {countResults}
			{textPage} ({timeRequest} сек.){' '}
		</div>
	)
}

export default function SearchListItems({ model }) {
	const { fetchRequestResults, data, pageCount, page, value, isLoading, storeChangePage } = model

	useEffect(() => {
		fetchRequestResults()
	}, [page])

	const renderItems = data.map(item => {
		return <SearchItem key={item.uid} model={item} />
	})

	const handleChangePage = currentPage => {
		storeChangePage(currentPage)
	}

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
		<React.Fragment>
			{!isLoading && renderStatResult(model)}
			{!isLoading && data.length === 0 ? renderEmpty(value) : null}

			{isLoading && renderLoader()}

			{!isLoading && renderItems}
			{pageCount > 1 && (
				<Paginations pageCount={pageCount} page={page} onChangePage={handleChangePage} />
			)}
		</React.Fragment>
	)
}
