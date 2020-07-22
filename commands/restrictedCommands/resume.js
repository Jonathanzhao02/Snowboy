const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Resumes the current song.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function resume (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received resume command')
  if (!guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  logger.debug('Resuming music')
  guildClient.connection.dispatcher.resume()
  Functions.sendMsg(guildClient.textChannel, `${Emojis.playing} **Resuming!**`, guildClient)
  logger.debug('Successfully resumed music')
}

module.exports = {
  name: 'resume',
  execute: resume
}
