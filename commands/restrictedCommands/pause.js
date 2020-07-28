const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Pauses the current song.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function pause (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received pause command')
  if (!guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  logger.debug('Pausing music')
  guildClient.connection.dispatcher.pause()
  Functions.sendMsg(guildClient.textChannel, `${Emojis.pause} ***Paused the music***`, guildClient)
  logger.debug('Successfully paused music')
}

module.exports = {
  name: 'pause',
  execute: pause
}
