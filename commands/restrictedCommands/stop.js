const { Emojis } = require('../../config')
const { Functions } = require('../../bot-util')

/**
 * Stops all song playback and clears the queue.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function stop (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received stop command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Stopping music')
  memberClient.guildClient.connection.dispatcher.end()
  Functions.playSilence(memberClient.guildClient)
  memberClient.guildClient.playing = false
  memberClient.guildClient.songQueue = []
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.stop} ***Stopped the music***`
  )
  logger.debug('Successfully stopped music')
}

module.exports = {
  name: 'stop',
  execute: stop
}
