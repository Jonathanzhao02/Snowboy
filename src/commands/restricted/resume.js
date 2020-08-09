const { Emojis } = require('../../config')

/**
 * Resumes the current song.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function resume (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received resume command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Resuming music')
  memberClient.guildClient.guildPlayer.resume()
  memberClient.guildClient.sendMsg(
    `${Emojis.playing} **Resuming!**`
  )
  logger.debug('Successfully resumed music')
}

module.exports = {
  name: 'resume',
  execute: resume
}
