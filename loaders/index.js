const Discord = require('./Discord')
const Logger = require('./Logger')
const Keyv = require('./Keyv')
const WebApis = require('./WebApis')
const Process = require('./Process')
const Common = require('../bot-util/Common')
const env = require('dotenv').config()
if (env.error) throw env.error

module.exports = async function (client) {
  Discord(client, Common)
  Logger(Common)
  Keyv(Common)
  Process(Common)
  WebApis()
}
