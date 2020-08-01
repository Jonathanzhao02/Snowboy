const { Emojis } = require('../../config')
const { Functions } = require('../../bot-util')

/**
 * Skips to the next song in queue by ending the current dispatcher.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function skip (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received skip command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Skipping song')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.skip} ***Skipping the current song***`
  )
  memberClient.guildClient.connection.dispatcher.end()
  logger.debug('Successfully skipped song')
}

module.exports = {
  name: 'skip',
  execute: skip
}
