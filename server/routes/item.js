import GetItemData from '../db/sphinxapi/GetItemData'

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
