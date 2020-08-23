const Discord = require('./Discord')
const Logger = require('./Logger')
const Keyv = require('./Keyv')
const FlatCache = require('./FlatCache')
const WebApis = require('./WebApis')
const Process = require('./Process')
const Dotenv = require('./Dotenv')
const Common = require('../bot-util/Common')

module.exports = function (client) {
  const obj = {}
  Dotenv()
  obj.logger = Logger()
  Discord(client)
  Keyv(Common)
  FlatCache(Common)
  Process(Common)
  WebApis()
  return obj
}
