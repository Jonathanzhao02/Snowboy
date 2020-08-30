const { Paths } = require('../config')
const FlatCache = require('flat-cache')

module.exports = function () {
  return FlatCache.load(Paths.defaultDbdir + '/flat.cache')
}
