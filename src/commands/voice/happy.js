const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy happy.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function compliment (context) {
  const logger = context.logger
  logger.info('Received compliment command')
  context.sendMsg(
    `${Emojis.happy} **Thank you!**`
  )
  context.userClient.updateImpression(ImpressionValues.HAPPY_VALUE)
}

module.exports = {
  name: 'compliment',
  usages: ['VOICE', 'GUILD_ONLY', 'IN_VOICE'],
  execute: compliment
}
