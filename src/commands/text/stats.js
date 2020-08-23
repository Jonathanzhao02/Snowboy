const Embeds = require('../../bot-util/Embeds')

/**
 * Prints the stats of Snowboy.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function stats (context) {
  const logger = context.logger
  logger.info('Received stats command')
  context.sendMsg(
    Embeds.createStatsEmbed(context.bot)
  )
}

module.exports = {
  name: 'stats',
  form: 'stats',
  description: 'Tells you about Snowboy\'s stats.',
  usages: ['TEXT'],
  execute: stats
}
