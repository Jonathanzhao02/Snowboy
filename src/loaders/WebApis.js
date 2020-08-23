const Wit = require('../web-apis/Wit')
const Gsearch = require('../web-apis/Gsearch')
const PokeApiV2 = require('../web-apis/PokeApiV2')

module.exports = function (cache) {
  // Set API keys and caches
  Gsearch.setKey(process.env.GOOGLE_API_TOKEN)
  Wit.setKey(process.env.WIT_API_TOKEN)
  PokeApiV2.setCache(cache)
}
