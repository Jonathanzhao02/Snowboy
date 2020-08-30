const Discord = require('./Discord')
const Logger = require('./Logger')
const FlatCache = require('./FlatCache')
const WebApis = require('./WebApis')
const Process = require('./Process')
const Dotenv = require('./Dotenv')

module.exports = function (client) {
  Dotenv()
  const logger = Logger()
  const cache = FlatCache()
  Process(client, cache, logger)
  WebApis(cache)
  Discord(client)
  return logger
}
