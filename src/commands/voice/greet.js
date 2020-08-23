const Responses = require('../../bot-util/Responses')
const { ImpressionValues, Emojis } = require('../../config')

/**
 * Greets a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function greet (context) {
  const logger = context.logger
  logger.info('Received greet command')
  context.sendMsg(
    `${Emojis.greeting} **${Responses.randomGreeting()},** <@${context.id}>!`
  )
  context.userClient.updateImpression(ImpressionValues.GREET_VALUE)
}

module.exports = {
  name: 'greet',
  usages: ['VOICE', 'GUILD_ONLY', 'WITH_BOT'],
  execute: greet
}
