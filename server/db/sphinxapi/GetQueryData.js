import sphinxClient from './index'
import config from './../../config'

module.exports = function GetQueryData({ value = '', page = 1, limit = 10 }, callback) {
	const offset = (page - 1) * limit
	//value = ClearValue(value)

	const optsBuildExcerpts = {
		before_match: '<strong>',
		after_match: '</strong>',
		chunk_separator: ' ... ',
		limit: 400,
		around: 15,
	}

	const maxLimit = 100

	sphinxClient.SetLimits(offset, limit, maxLimit)
	sphinxClient.Query(value, function(err, sphinxResult) {
		if (err !== null) return callback([])

		console.log('sphinxResult :', sphinxResult.matches[0])

		let arrayText = sphinxResult.matches.map(item => {
			return item.attrs['text']
		})

		sphinxClient.BuildExcerpts(
			arrayText,
			config.sphinxIndex,
			value,
			optsBuildExcerpts,
			function(err, arrHighlight) {
				if (err !== null) return callback([])
				const result = sphinxResult.matches.map((item, index) => {
					item.attrs.highlight = arrHighlight[index]
					return item
				})

				sphinxResult.matches = result

				return callback(sphinxResult)
			},
		)
	})
}
