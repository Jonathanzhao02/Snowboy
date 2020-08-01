const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')

/**
 * Resumes the current song.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function resume (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received resume command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Resuming music')
  memberClient.guildClient.connection.dispatcher.resume()
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.playing} **Resuming!**`
  )
  logger.debug('Successfully resumed music')
}

module.exports = {
  name: 'resume',
  execute: resume
}
