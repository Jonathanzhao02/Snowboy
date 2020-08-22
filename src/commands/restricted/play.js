const { Emojis } = require('../../config')

/**
 * Plays or queues a song or playlist.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function play (context) {
  const logger = context.logger
  logger.info('Received play command')
  // If not connected, notify and return
  if (!context.guildClient.connection) {
    logger.debug('Not connected to a voice channel')
    context.sendMsg(
      `${Emojis.error} ***I am not in a voice channel!***`
    )
    return
  }

  // If no query, notify and return
  if (!context.args || context.args.length === 0) {
    logger.debug('No query found')
    context.sendMsg(
      `${Emojis.error} ***I need something to play!***`
    )
    return
  }

  const query = context.args.join(' ')
  logger.debug('Searching up %s', query)
  context.guildClient.guildPlayer.songQueuer.search(query, context.name, context.channel)
}

module.exports = {
  name: 'play',
  form: 'play <URL or search terms>',
  description: 'Searches up a playlist or video and adds it to the queue.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'IN_VOICE'],
  execute: play
}
