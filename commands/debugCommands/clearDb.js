const Common = require('../../common')
const { Functions } = require('../../bot-util')

/**
 * Clears Snowboy's database completely and shuts the bot down.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function clearDb (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received clear database command')
  Common.keyv.clear()
  Functions.sendMsg(guildClient.textChannel, 'Cleared Database', guildClient).then(() => {
    Functions.sendMsg(guildClient.textChannel, 'Shutting down Snowboy, restart for changes to take effect', guildClient).then(() => {
      process.exit(0)
    })
  })
}

module.exports = {
  name: 'cleardb',
  execute: clearDb
}
