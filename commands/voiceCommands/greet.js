const Common = require('../../common')
const Emojis = require('../../emojis')
const { Responses, Functions } = require('../../bot-util')
const Config = require('../../config')

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
    `${Emojis.greeting} **${Responses.greetings[Functions.random(Responses.greetings.length)]},** <@${memberClient.id}>!`,
    memberClient.guildClient.settings.mentions
  )
  Functions.updateImpression(
    Common.uKeyv,
    memberClient.id,
    memberClient.userClient,
    Config.ImpressionValues.GREET_VALUE,
    memberClient.userClient.settings.impressions
  )
}

module.exports = {
  name: 'greet',
  execute: greet
}
