const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Skips to the next song in queue by ending the current dispatcher.
 *
 * @param {Object} guildClient The guildClient of the server with song playback.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function skip (guildClient, userId, args) {
  guildClient.logger.info('Received skip command')
  if (!guildClient.playing) {
    guildClient.logger.debug('Not playing anything')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Nothing currently playing!***`, guildClient)
    return
  }
  guildClient.logger.debug('Skipping music')
  Functions.sendMsg(guildClient.textChannel, `${Emojis.skip} ***Skipping the current song***`, guildClient)
  guildClient.connection.dispatcher.end()
  guildClient.logger.debug('Successfully skipped music')
}

module.exports = {
  name: 'skip',
  execute: skip
}
