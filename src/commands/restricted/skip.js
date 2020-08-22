const { Emojis } = require('../../config')

/**
 * Skips to the next song in queue by ending the current dispatcher.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function skip (context) {
  const logger = context.logger
  logger.info('Received skip command')
  if (!context.guildClient.playing) {
    logger.debug('Not playing anything')
    context.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Skipping song')
  context.guildClient.guildPlayer.end()
  context.guildClient.sendMsg(
    `${Emojis.skip} ***Skipping the current song***`
  )
  logger.debug('Successfully skipped song')
}

module.exports = {
  name: 'skip',
  form: 'skip',
  description: 'Tells Snowboy to skip the current song.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'IN_VOICE'],
  execute: skip
}
