const { Emojis } = require('../../config')

/**
 * Loops or stops looping current song queue.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function loopQueue (context) {
  const logger = context.logger
  logger.info('Received loopqueue command')
  if (!context.guildClient.playing) {
    logger.debug('Not playing anything')
    context.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
    return
  }
  if (context.guildClient.loopState === 2) {
    logger.debug('Stopping queue loop')
    context.guildClient.loopState = 0
  } else {
    logger.debug('Looping queue')
    context.guildClient.loopState = 2
  }

  context.sendMsg(
    `${Emojis.loop} **${context.guildClient.loopState === 0 ? 'No longer' : 'Now'} looping the song!**`
  )
}

module.exports = {
  name: 'loopqueue',
  form: 'loopqueue',
  description: 'Tells Snowboy to loop the current queue.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'IN_VOICE'],
  execute: loopQueue
}
