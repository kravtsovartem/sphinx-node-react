const sphinxClient = require('../db')

function ClearValue(value) {
	return value.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
}

function GetItemData(value, propName, callback) {
	//value = ClearValue(value)

	const optsBuildExcerpts = {
		before_match: '<strong>',
		after_match: '</strong>',
		chunk_separator: ' ... ',
		limit: 400,
		around: 15,
	}

	sphinxClient.SetLimits(0, 1, 1)
	sphinxClient.Query(value, function(err, sphinxResult) {
		if (err !== null && sphinxResult.matches.length > 0) return callback({})

		return callback(sphinxResult.matches[0].attrs)
	})
}

function routes(fastify, options, next) {
	fastify.post('/', function(req, res, next) {
		const { value } = req.body
		GetItemData(value, 'text', function(callback) {
			res.send({
				success: true,
				data: callback,
			})
		})
    })
    
    next()
}

module.exports = routes
