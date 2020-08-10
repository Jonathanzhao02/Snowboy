const Discord = require('./Discord')
const Logger = require('./Logger')
const Keyv = require('./Keyv')
const WebApis = require('./WebApis')
const Process = require('./Process')
const Paths = require('./Paths')
const Dotenv = require('./Dotenv')
const Common = require('../bot-util/Common')

module.exports = function (client) {
  Paths(Common)
  Dotenv(Common)
  Discord(client, Common)
  Logger(Common)
  Keyv(Common)
  Process(Common)
  WebApis()
}
