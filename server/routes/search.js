import GetSuggestData from '../db/sphinxapi/GetSuggestData'
import GetQueryData from '../db/sphinxapi/GetQueryData'

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
