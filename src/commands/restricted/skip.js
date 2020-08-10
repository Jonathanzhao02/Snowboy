const { Emojis } = require('../../config')

/**
 * Skips to the next song in queue by ending the current dispatcher.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function skip (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received skip command')
  if (!memberClient.guildClient.playing) {
    logger.debug('Not playing anything')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Skipping song')
  memberClient.guildClient.guildPlayer.end()
  memberClient.guildClient.sendMsg(
    `${Emojis.skip} ***Skipping the current song***`
  )
  logger.debug('Successfully skipped song')
}

module.exports = {
  name: 'skip',
  form: 'skip',
  description: 'Tells Snowboy to skip the current song.',
  execute: skip
}
