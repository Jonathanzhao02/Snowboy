const Gsearch = require('./web_apis/gsearch')
const Wit = require('./web_apis/wit')

Gsearch.setKey(process.env.GOOGLE_API_TOKEN)
Wit.setKey(process.env.WIT_API_TOKEN)

/**
 * Sets the bot client used for commands.
 *
 * @param {Discord.Client} client The Client of the bot to be used.
 */
function setClient (client) {
  module.exports.botClient = client
}

/**
 * Sets the database used for commands.
 *
 * @param {Keyv} db The Keyv database to be used.
 */
function setGKeyv (db) {
  module.exports.gKeyv = db
}

/**
 * Sets the database used for commands.
 *
 * @param {Keyv} db The Keyv database to be used.
 */
function setUKeyv (db) {
  module.exports.uKeyv = db
}

/**
 * Sets the logger used for non-guild-specific functions.
 *
 * @param {Any} lgr The logger to use.
 */
function setLogger (lgr) {
  module.exports.logger = lgr
}

module.exports = {
  setClient: setClient,
  setGKeyv: setGKeyv,
  setUKeyv: setUKeyv,
  setLogger: setLogger
}
