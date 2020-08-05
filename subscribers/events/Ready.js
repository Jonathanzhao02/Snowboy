const Common = require('../../bot-util/Common')

module.exports = function (client) {
  // Logs that the client is ready in console
  client.on('ready', () => {
    Common.logger.info('Started up at %s', new Date().toString())
    Common.logger.info('Logged in as %s', client.user.tag)
    Common.logger.info(`Currently in ${client.guilds.cache.size} guilds!`)
  })
}
