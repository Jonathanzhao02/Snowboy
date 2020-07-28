const Common = require('../../common')
const Emojis = require('../../emojis')
const { Responses, Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Greets a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function greet (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received greet command')
  Functions.sendMsg(
    guildClient.textChannel,
    `${Emojis.greeting} **${Responses.greetings[Functions.random(Responses.greetings.length)]},** <@${userClient.id}>!`,
    guildClient
  )
  Functions.updateImpression(
    Common.uKeyv,
    userClient.id,
    userClient,
    Config.ImpressionValues.GREET_VALUE,
    userClient.settings.impressions
  )
}

module.exports = {
  name: 'greet',
  execute: greet
}
