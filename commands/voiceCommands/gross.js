const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Makes Snowboy grossed out.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function gross (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received gross command')
  const userClient = Common.botClient.userClients.get(userId)
  Functions.sendMsg(guildClient.textChannel, `${Emojis.weird} **Not much I can do for you, <@${userId}>**`, guildClient)
  Functions.updateImpression(Common.uKeyv, userId, userClient, Config.ImpressionValues.GROSS_VALUE, userClient.settings.impressions)
}

module.exports = {
  name: 'gross',
  execute: gross
}
