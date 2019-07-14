const fs = require('fs')
const util = require('util')

module.exports = fileName => util.promisify(fs.readFile)(fileName, 'utf8')
