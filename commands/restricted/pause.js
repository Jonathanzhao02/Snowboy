const { Emojis } = require('../../config')

/**
 * Pauses the current song.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function pause (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received pause command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Pausing music')
  memberClient.guildClient.connection.dispatcher.pause()
  memberClient.guildClient.sendMsg(
    `${Emojis.pause} ***Paused the music***`
  )
  logger.debug('Successfully paused music')
}

module.exports = {
  name: 'pause',
  execute: pause
}
