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
function sad (guildClient, userId, args) {
  guildClient.logger.info('Received sad command')
  Functions.sendMsg(guildClient.textChannel, `${Emojis.sad} *Okay...*`, guildClient)
  Functions.updateImpression(Common.keyv, guildClient, userId, Config.ImpressionValues.SAD_VALUE, guildClient.settings.impressions)
}

module.exports = {
  name: 'insult',
  execute: sad
}
