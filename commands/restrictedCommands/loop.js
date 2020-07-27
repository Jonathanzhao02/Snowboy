const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Loops or stops looping current song.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function loop (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received loop command')
  if (!guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }

  if (guildClient.loopState === 1) {
    logger.debug('Stopping song loop')
    guildClient.loopState = 0
    Functions.sendMsg(guildClient.textChannel, `${Emojis.loop} **No longer looping the song!**`, guildClient)
  } else {
    logger.debug('Looping song')
    guildClient.loopState = 1
    Functions.sendMsg(guildClient.textChannel, `${Emojis.loop} **Now looping the song!**`, guildClient)
  }
}

module.exports = {
  name: 'loop',
  execute: loop
}
