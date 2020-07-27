const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Makes Snowboy mildy irritated that someone called it just to say nevermind.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function nevermind (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received nevermind command')
  Functions.sendMsg(guildClient.textChannel, `${Emojis.angry} **Call me only when you need me, <@${userId}>!**`, guildClient)
  Functions.updateImpression(Common.keyv, guildClient, userId, Config.ImpressionValues.NEVERMIND_VALUE, guildClient.settings.impressions)
}

module.exports = {
  name: 'nevermind',
  execute: nevermind
}
