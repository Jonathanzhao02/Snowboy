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
function happy (guildClient, userId, args) {
  guildClient.logger.info('Received happy command')
  Functions.sendMsg(guildClient.textChannel, `${Emojis.happy} **Thank you!**`)
  Functions.updateImpression(Common.keyv, guildClient, userId, Config.ImpressionValues.HAPPY_VALUE, guildClient.settings.impressions)
}

module.exports = {
  name: 'compliment',
  execute: happy
}
