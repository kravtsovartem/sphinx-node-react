import sphinxClient from './index'
import config from './../../config'

function ClearValue(value) {
	try {
		return value.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
	} catch (ex) {
		return ''
	}
}

module.exports = function GetSuggestData({ value = '', limit = 10 }, callback) {
	value = ClearValue(value)

	const maxLimit = limit
	sphinxClient.SetLimits(0, limit, maxLimit)
	sphinxClient.Query(value, function(err, sphinxResult) {
		if (err !== null) return callback([])

		let arrayText = sphinxResult.matches.map(item => {
			return item.attrs['name']
		})

		const opts = {
			before_match: '<strong>',
			after_match: '</strong>',
			chunk_separator: '',
			limit: 400,
			around: 15,
		}

		sphinxClient.BuildExcerpts(arrayText, config.sphinxIndex, value, opts, function(
			err,
			arrHighlight,
		) {
			if (err !== null) return callback([])

			return callback(arrHighlight)
		})
	})
}
