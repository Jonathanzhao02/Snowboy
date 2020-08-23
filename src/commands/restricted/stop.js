const { Emojis } = require('../../config')

/**
 * Stops all song playback and clears the queue.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function stop (context) {
  const logger = context.logger
  logger.info('Received stop command')
  logger.debug('Stopping music')
  context.guildClient.guildPlayer.stop()
  context.sendMsg(
    `${Emojis.stop} ***Stopped the music***`
  )
  logger.debug('Successfully stopped music')
}

module.exports = {
  name: 'stop',
  form: 'stop',
  description: 'Tells Snowboy to stop the current song and clear the queue.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'WITH_BOT', 'MUSIC_PLAYING'],
  execute: stop
}
