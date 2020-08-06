const Discord = require('./Discord')
const Logger = require('./Logger')
const Keyv = require('./Keyv')
const WebApis = require('./WebApis')
const Process = require('./Process')
const Paths = require('./Paths')
const Common = require('../bot-util/Common')
const env = require('dotenv').config()
if (env.error) throw env.error

module.exports = function (client) {
  Discord(client, Common)
  Paths(Common)
  Logger(Common)
  Keyv(Common)
  Process(Common)
  WebApis()
}
