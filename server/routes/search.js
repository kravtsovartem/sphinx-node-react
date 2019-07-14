import sphinxClient from '../db'

function ClearValue(value) {
	return value.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
}

function GetQueryData({ value, page, limit }, propName, callback) {
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

		let arrayText = sphinxResult.matches.map(item => {
			return item.attrs[propName]
		})

		sphinxClient.BuildExcerpts(arrayText, 'index_news', value, optsBuildExcerpts, function(
			err,
			arrHighlight,
		) {
			if (err !== null) return callback([])
			const result = sphinxResult.matches.map((item, index) => {
				item.attrs.highlight = arrHighlight[index]
				return item
			})

			sphinxResult.matches = result

			return callback(sphinxResult)
		})
	})
}

function GetSuggestData(word, propName, callback) {
	word = ClearValue(word)

	sphinxClient.Query(word, function(err, sphinxResult) {
		if (err !== null) return callback([])

		let arrayText = sphinxResult.matches.map(item => {
			return item.attrs[propName]
		})

		const opts = {
			before_match: '<strong>',
			after_match: '</strong>',
			chunk_separator: '',
			limit: 400,
			around: 15,
		}

		sphinxClient.BuildExcerpts(arrayText, 'index_news', word, opts, function(
			err,
			arrHighlight,
		) {
			if (err !== null) return callback([])

			return callback(arrHighlight)
		})
	})
}

function routes(fastify, options, next) {
	fastify.post('/', function(req, res) {
		const { value, page, limit } = req.body
		GetQueryData({ value, page, limit }, 'text', function(callback) {
			res.send({
				success: true,
				data: callback,
			})
		})
	})

	fastify.post('/suggest', function(req, res) {
		const word = req.body.value
		GetSuggestData(word, 'name', function(callback) {
			res.send({
				success: true,
				data: callback,
			})
		})
	})
	next()
}

module.exports = routes
