import React from 'react'
import ReactPaginate from 'react-paginate'
import { css } from 'emotion'

const style = css`
	ul {
		text-align: center;
		margin: 0;
		padding: 5px 0;
		background: #fafafa;
		user-select: none;
	}

	li {
		display: inline-block;
		cursor: pointer;
		color: #005f8e;
		border: 1px solid #fafafa;
	}

	.active {
		color: #00a5f5;
		background: #ffffff;
		border: 1px solid grey;
	}

	li:hover:not(.active) {
		background-color: #ddd;
		border: 1px solid grey;
	}

	li[class*='disabled'] {
		display: none;
	}

	a {
		color: black;
		float: left;
		text-decoration: none;
		outline: none;
		padding: 8px 16px;
	}

	.previous,
	.next {
	}
`

export default function Paginations(props) {
	const { pageCount, page, dispatchChangePage } = props

	const handlePageClick = ({ selected }) => {
		dispatchChangePage(selected + 1)
		window.scrollTo(0, 0)
	}

	return (
		<div className={style}>
			<ReactPaginate
				previousLabel={page !== 1 ? 'Предыдущая' : ''}
				nextLabel={page !== pageCount ? 'Следующая' : ''}
				breakLabel="..."
				breakClassName="break-me"
				pageCount={pageCount}
				marginPagesDisplayed={1}
				pageRangeDisplayed={5}
				onPageChange={handlePageClick}
				containerClassName="pagination"
				subContainerClassName="pages pagination"
				activeClassName="active"
			/>
		</div>
	)
}
