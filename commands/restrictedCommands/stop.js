const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Stops all song playback and clears the queue.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function stop (guildClient, userId, args) {
  guildClient.logger.info('Received stop command')
  if (!guildClient.playing) {
    guildClient.logger.debug('Not playing anything')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  guildClient.logger.debug('Stopping music')
  guildClient.connection.dispatcher.end()
  Functions.playSilence(guildClient)
  guildClient.playing = false
  guildClient.songQueue = []
  Functions.sendMsg(guildClient.textChannel, `${Emojis.stop} ***Stopped the music***`, guildClient)
  guildClient.logger.debug('Successfully stopped music')
}

module.exports = {
  name: 'stop',
  execute: stop
}
