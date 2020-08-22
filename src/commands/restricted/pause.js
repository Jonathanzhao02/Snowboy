const { Emojis } = require('../../config')

/**
 * Pauses the current song.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function pause (context) {
  const logger = context.logger
  logger.info('Received pause command')
  if (!context.guildClient.playing) {
    logger.debug('Not playing anything')
    context.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  logger.debug('Pausing music')
  context.guildClient.guildPlayer.pause()
  context.sendMsg(
    `${Emojis.pause} ***Paused the music***`
  )
  logger.debug('Successfully paused music')
}

module.exports = {
  name: 'pause',
  form: 'pause',
  description: 'Tells Snowboy to pause the current song.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'IN_VOICE'],
  execute: pause
}
