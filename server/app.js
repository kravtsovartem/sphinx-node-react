const nr = require('newrelic')

const createError = require('http-errors')
const path = require('path')
const cookieParser = require('cookie-parser')
const sphinxClient = require('./db/sphinxapi')
const helmet = require('fastify-helmet')
//{ prettyPrint: { colorize: true } }
const fastify = require('fastify')({
	logger: false,
})

fastify.register(helmet, {
	hidePoweredBy: { setTo: 'PHP 4.2.0' },
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
		},
	},
})

fastify.register(require('./routes/search'), { prefix: '/search' })
fastify.register(require('./routes/item'), { prefix: '/item' })

sphinxClient.Status(function(err, result) {
	console.log('Sphinx:', 'Соединение установлено успешно!')
})

fastify.listen(3001, function(err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
	fastify.log.info(`server listening on ${address}`)
})
