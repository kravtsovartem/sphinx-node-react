import sphinxClient from '../db'
import config from '../config'

function ClearValue(value) {
	try {
		return value.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
	} catch (ex) {
		return ''
	}
}

function GetQueryData({ value = '', page = 1, limit = 10 }, callback) {
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

function GetSuggestData({ value = '', limit = 10 }, callback) {
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

function routes(fastify, options, next) {
	fastify.post('/', function(req, res) {
		GetQueryData({ ...req.body }, function(callback) {
			res.send({
				success: true,
				data: callback,
			})
		})
	})

	fastify.post('/suggest', function(req, res) {
		GetSuggestData({ ...req.body }, function(callback) {
			res.send({
				success: true,
				data: callback,
			})
		})
	})
	next()
}

module.exports = routes
