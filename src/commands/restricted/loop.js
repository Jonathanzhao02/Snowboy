const { Emojis } = require('../../config')

/**
 * Loops or stops looping current song.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function loop (context) {
  const logger = context.logger
  logger.info('Received loop command')
  if (!context.guildClient.playing) {
    logger.debug('Not playing anything')
    context.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }

  if (context.guildClient.loopState === 1) {
    logger.debug('Stopping song loop')
    context.guildClient.loopState = 0
  } else {
    logger.debug('Looping song')
    context.guildClient.loopState = 1
  }

  context.sendMsg(
    `${Emojis.loop} **${context.guildClient.loopState === 0 ? 'No longer' : 'Now'} looping the song!**`
  )
}

module.exports = {
  name: 'loop',
  form: 'loop',
  description: 'Tells Snowboy to loop the current song.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'IN_VOICE'],
  execute: loop
}
