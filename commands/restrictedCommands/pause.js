const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Pauses the current song.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function pause (guildClient, userId, args) {
  guildClient.logger.info('Received pause command')
  if (!guildClient.playing) {
    guildClient.logger.debug('Not playing anything')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  guildClient.logger.debug('Pausing music')
  guildClient.connection.dispatcher.pause()
  Functions.sendMsg(guildClient.textChannel, `${Emojis.pause} ***Paused the music***`, guildClient)
  guildClient.logger.debug('Successfully paused music')
}

module.exports = {
  name: 'pause',
  execute: pause
}