const { Emojis } = require('../../config')

/**
 * Plays or queues a song or playlist.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function play (context) {
  const logger = context.logger
  logger.info('Received play command')

  // If no query, notify and return
  if (context.args.empty) {
    logger.debug('No query found')
    context.sendMsg(
      `${Emojis.error} ***I need something to play!***`
    )
    return
  }

  const query = context.args.join()
  logger.debug('Searching up %s', query)
  context.guildClient.guildPlayer.songQueuer.search(query, context.name, context.channel)
}

module.exports = {
  name: 'play',
  form: 'play <URL or search terms>',
  description: 'Searches up a playlist or video and adds it to the queue.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'WITH_BOT'],
  execute: play
}
