const sphinxClient = require('./index')

module.exports = function GetItemData(value, propName, callback) {

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