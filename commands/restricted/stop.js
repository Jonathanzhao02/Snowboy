const { Emojis } = require('../../config')

/**
 * Stops all song playback and clears the queue.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function stop (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received stop command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Stopping music')
  memberClient.guildClient.songQueue = []
  memberClient.guildClient.connection.dispatcher.end()
  memberClient.guildClient.sendMsg(
    `${Emojis.stop} ***Stopped the music***`
  )
  logger.debug('Successfully stopped music')
}

module.exports = {
  name: 'stop',
  execute: stop
}
