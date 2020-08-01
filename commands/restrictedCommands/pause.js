const { Emojis } = require('../../config')
const { Functions } = require('../../bot-util')

/**
 * Pauses the current song.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function pause (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received pause command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Pausing music')
  memberClient.guildClient.connection.dispatcher.pause()
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.pause} ***Paused the music***`
  )
  logger.debug('Successfully paused music')
}

module.exports = {
  name: 'pause',
  execute: pause
}
