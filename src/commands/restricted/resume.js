const { Emojis } = require('../../config')

/**
 * Resumes the current song.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function resume (context) {
  const logger = context.logger
  logger.info('Received resume command')
  logger.debug('Resuming music')
  context.guildClient.guildPlayer.resume()
  context.sendMsg(
    `${Emojis.playing} **Resuming!**`
  )
  logger.debug('Successfully resumed music')
}

module.exports = {
  name: 'resume',
  form: 'resume',
  description: 'Tells Snowboy to resume the current song.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'WITH_BOT', 'MUSIC_PLAYING'],
  execute: resume
}
