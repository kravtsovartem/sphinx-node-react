const SphinxClient = require('sphinxapi'),
	util = require('util'),
	assert = require('assert')

const cl = new SphinxClient()
cl.SetServer('localhost', 9312)
cl.SetFieldWeights({
	name: 15000,
	text: 30000,
})

cl.SetMatchMode(SphinxClient.SPH_MATCH_EXTENDED)

module.exports = cl
