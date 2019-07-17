import React, { useState, useEffect } from 'react'
import Autosuggest from 'react-autosuggest'
import queryString from 'query-string'

import { withRouter } from 'react-router-dom'

function strip(html) {
	if (html === undefined) return ''
	return html.replace(/<[^>]*>?/gm, '')
}

function renderSuggestion(suggestion) {
	return <span dangerouslySetInnerHTML={{ __html: suggestion }}></span>
}

function SearchInput(props) {
	const { model } = props
	const {
		value,
		suggestions,
		routerLocationSearch,
		fetchSuggestionsRequest,
		fetchRequestResults,
	} = model

	const [text, setText] = useState(value)

	useEffect(() => {
		const oQueryString = queryString.parse(routerLocationSearch)

		const queryWord = oQueryString.q
		if (queryWord !== undefined && queryWord !== null && queryWord.trim().length > 0) {
			setText(queryWord)
		}
	}, [])

	const requestSuggestions = word => {
		fetchSuggestionsRequest(word)
	}

	const onChangeText = (e, { newValue, method }) => {
		if (e.keyCode === 40 || e.keyCode === 38) return
		requestSuggestions(newValue)
		setText(newValue)
	}

	const handleKeyDownEnter = e => {
		if (e.key === 'Enter') {
			const url = text.trim().length > 0 ? `/search?q=${text}` : '/'
			props.history.push(url)
			fetchRequestResults(text)
		}
	}

	const getSuggestionValue = suggestion => {
		return strip(suggestion)
	}

	const onSuggestionSelected = (
		event,
		{ suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
	) => {}

	const inputProps = {
		placeholder: 'Поиск..',
		value: text,
		onChange: onChangeText,
		onKeyDown: handleKeyDownEnter,
		type: 'search',
	}

	const onSuggestionsClearRequested = () => {}
	const onSuggestionsFetchRequested = () => {}

	return (
		<React.Fragment>
			<Autosuggest
				suggestions={suggestions}
				onSuggestionsFetchRequested={onSuggestionsFetchRequested}
				onSuggestionsClearRequested={onSuggestionsClearRequested}
				getSuggestionValue={getSuggestionValue}
				onSuggestionSelected={onSuggestionSelected}
				renderSuggestion={renderSuggestion}
				inputProps={inputProps}
			/>
			<br />
		</React.Fragment>
	)
}

export default withRouter(SearchInput)
