const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy grossed out.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function gross (context) {
  const logger = context.logger
  logger.info('Received gross command')
  context.sendMsg(
    `${Emojis.weird} **Not much I can do for you, <@${context.id}>**`
  )
  context.userClient.updateImpression(ImpressionValues.GROSS_VALUE)
}

module.exports = {
  name: 'gross',
  usages: ['VOICE', 'GUILD_ONLY', 'WITH_BOT'],
  execute: gross
}
