const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy sad.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function insult (context) {
  const logger = context.logger
  logger.info('Received insult command')
  context.sendMsg(
    `${Emojis.sad} *Okay...*`
  )
  context.userClient.updateImpression(ImpressionValues.SAD_VALUE)
}

module.exports = {
  name: 'insult',
  usages: ['VOICE', 'GUILD_ONLY', 'IN_VOICE'],
  execute: insult
}
