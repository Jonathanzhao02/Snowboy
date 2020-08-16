const FlatCache = require('flat-cache')

module.exports = function (Common) {
  Common.set('pokeApiCache', FlatCache.load(Common.defaultResdir + '/flat.cache'))
}
