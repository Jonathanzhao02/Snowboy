const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Loops or stops looping current song.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function loop (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received loop command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }

  if (memberClient.guildClient.loopState === 1) {
    logger.debug('Stopping song loop')
    memberClient.guildClient.loopState = 0
  } else {
    logger.debug('Looping song')
    memberClient.guildClient.loopState = 1
  }

  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.loop} **${memberClient.guildClient.loopState === 0 ? 'No longer' : 'Now'} looping the song!**`
  )
}

module.exports = {
  name: 'loop',
  execute: loop
}
