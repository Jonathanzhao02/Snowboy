const Common = require('../../bot-util/Common')
const Responses = require('../../bot-util/Responses')
const Impressions = require('../../bot-util/Impressions')
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
  Impressions.updateImpression(
    Common.uKeyv,
    memberClient.id,
    memberClient.userClient,
    ImpressionValues.GREET_VALUE,
    memberClient.userClient.settings.impressions
  )
}

module.exports = {
  name: 'greet',
  execute: greet
}
