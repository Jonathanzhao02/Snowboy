const Common = require('../../common')
const { Responses, Functions, Impressions } = require('../../bot-util')
const { ImpressionValues, Emojis } = require('../../config')

/**
 * Greets a user.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function greet (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received greet command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.greeting} **${Responses.randomGreeting()},** <@${memberClient.id}>!`,
    memberClient.guildClient.settings.mentions
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