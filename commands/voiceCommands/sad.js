const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Makes Snowboy sad.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function insult (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received insult command')
  const userClient = Common.botClient.userClients.get(userId)
  Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} *Okay...*`, guildClient)
  Functions.updateImpression(Common.uKeyv, userId, userClient, Config.ImpressionValues.SAD_VALUE, userClient.settings.impressions)
}

module.exports = {
  name: 'insult',
  execute: insult
}
