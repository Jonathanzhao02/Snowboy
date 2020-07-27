const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Loops or stops looping current song queue.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function loopQueue (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received loopqueue command')
  if (!guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  if (guildClient.loopState === 2) {
    logger.debug('Stopping queue loop')
    guildClient.loopState = 0
    Functions.sendMsg(guildClient.textChannel, `${Emojis.loop} **No longer looping the queue!**`, guildClient)
  } else {
    logger.debug('Looping queue')
    guildClient.loopState = 2
    Functions.sendMsg(guildClient.textChannel, `${Emojis.loop} **Now looping the queue!**`, guildClient)
  }
}

module.exports = {
  name: 'loopqueue',
  execute: loopQueue
}
