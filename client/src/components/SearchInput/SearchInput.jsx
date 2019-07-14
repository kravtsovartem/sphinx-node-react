import React, { useState, useEffect } from 'react'
import Autosuggest from 'react-autosuggest'
import queryString from 'query-string'

function strip(html) {
	return html.replace(/<[^>]*>?/gm, '')
}

function renderSuggestion(suggestion) {
	return strip(suggestion)
	return <span dangerouslySetInnerHTML={{ __html: suggestion }}></span>
}

export default function SearchInput({ model }) {
	const {
		value,
		suggestions,
		onSuggestionsFetchRequested,
		onSuggestionsClearRequested,
		onChange,
		routerLocationSearch,
	} = model

	const [text, setText] = useState(value)

	useEffect(() => {
		const oQueryString = queryString.parse(routerLocationSearch)

		const queryWord = oQueryString.q
		if (queryWord !== undefined && queryWord !== null && queryWord.trim().length > 0) {
			setText(queryWord)
			onChange(queryWord)
		}
	}, [])

	const onChangeText = (e, { newValue, method }) => {
		setText(newValue)
	}

	const handleKeyDownEnter = e => {
		if (e.key === 'Enter') {
			onChange(text)
		}
	}

	const getSuggestionValue = suggestion => {
		return strip(suggestion)
	}

	const onSuggestionSelected = (
		event,
		{ suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
	) => {
		onChange(suggestionValue)
	}

	const inputProps = {
		placeholder: 'Поиск..',
		value: text,
		onChange: onChangeText,
		onKeyDown: handleKeyDownEnter,
		type: 'search',
	}

	return (
		<div>
			<Autosuggest
				suggestions={suggestions}
				onSuggestionsFetchRequested={onSuggestionsFetchRequested}
				onSuggestionsClearRequested={onSuggestionsClearRequested}
				getSuggestionValue={getSuggestionValue}
				onSuggestionSelected={onSuggestionSelected}
				renderSuggestion={renderSuggestion}
				highlightFirstSuggestion
				inputProps={inputProps}
			/>
			<br />
		</div>
	)
}
