const Common = require('../../common')
const { Functions } = require('../../bot-util')

/**
 * Clears Snowboy's database completely and shuts the bot down.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function clearDb (guildClient, userClient, args, msg) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received clear database command')
  Common.gKeyv.clear()
  Common.uKeyv.clear()
  Functions.sendMsg(
    guildClient.textChannel,
    'Cleared Database',
    guildClient
  ).then(() => {
    Functions.sendMsg(
      guildClient.textChannel,
      'Shutting down Snowboy, restart for database changes to take effect',
      guildClient
    ).then(() => {
      process.emit('SIGINT')
    })
  })
}

module.exports = {
  name: 'cleardb',
  execute: clearDb
}
