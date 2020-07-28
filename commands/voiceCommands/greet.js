const Common = require('../../common')
const Emojis = require('../../emojis')
const { Responses, Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Greets a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function greet (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received greet command')
  const userClient = Common.botClient.userClients.get(userId)
  Functions.sendMsg(guildClient.textChannel,
    `${Emojis.greeting} **${Responses.greetings[Functions.random(Responses.greetings.length)]},** <@${userId}>!`,
    guildClient)
  Functions.updateImpression(Common.uKeyv, userId, userClient, Config.ImpressionValues.GREET_VALUE, userClient.settings.impressions)
}

module.exports = {
  name: 'greet',
  execute: greet
}
