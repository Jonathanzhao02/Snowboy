const Wit = require('../web-apis/Wit')
const Gsearch = require('../web-apis/Gsearch')

module.exports = function () {
  // Set API keys
  Gsearch.setKey(process.env.GOOGLE_API_TOKEN)
  Wit.setKey(process.env.WIT_API_TOKEN)
}
