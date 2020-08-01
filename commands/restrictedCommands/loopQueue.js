const { Emojis } = require('../../config')
const { Functions } = require('../../bot-util')

/**
 * Loops or stops looping current song queue.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function loopQueue (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received loopqueue command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  if (memberClient.guildClient.loopState === 2) {
    logger.debug('Stopping queue loop')
    memberClient.guildClient.loopState = 0
  } else {
    logger.debug('Looping queue')
    memberClient.guildClient.loopState = 2
  }

  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.loop} **${memberClient.guildClient.loopState === 0 ? 'No longer' : 'Now'} looping the song!**`
  )
}

module.exports = {
  name: 'loopqueue',
  execute: loopQueue
}
