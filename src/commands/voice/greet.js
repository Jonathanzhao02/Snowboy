const Responses = require('../../bot-util/Responses')
const { ImpressionValues, Emojis } = require('../../config')

/**
 * Greets a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function greet (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received greet command')
  memberClient.guildClient.sendMsg(
    `${Emojis.greeting} **${Responses.randomGreeting()},** <@${memberClient.id}>!`
  )
  memberClient.userClient.updateImpression(ImpressionValues.GREET_VALUE)
}

module.exports = {
  name: 'greet',
  execute: greet
}
