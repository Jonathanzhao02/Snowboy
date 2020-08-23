const Responses = require('../../bot-util/Responses')
const { ImpressionValues, Emojis } = require('../../config')

/**
 * Greets a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function greeting (context) {
  const logger = context.logger
  logger.info('Received greet command')
  context.sendMsg(
    `${Emojis.greeting} **${Responses.randomGreeting()},** <@${context.id}>!`
  )
  context.userClient.updateImpression(ImpressionValues.GREET_VALUE)
}

module.exports = {
  name: 'greeting',
  usages: ['VOICE', 'GUILD_ONLY', 'WITH_BOT'],
  execute: greeting
}
