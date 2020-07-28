const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Makes Snowboy happy.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function compliment (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received compliment command')
  const userClient = Common.botClient.userClients.get(userId)
  Functions.sendMsg(guildClient.textChannel, `${Emojis.happy} **Thank you!**`)
  Functions.updateImpression(Common.uKeyv, userId, userClient, Config.ImpressionValues.HAPPY_VALUE, userClient.settings.impressions)
}

module.exports = {
  name: 'compliment',
  execute: compliment
}
