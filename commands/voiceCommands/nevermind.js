const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Makes Snowboy mildy irritated that someone called it just to say nevermind.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function nevermind (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received nevermind command')
  Functions.sendMsg(
    guildClient.textChannel,
    `${Emojis.angry} **Call me only when you need me, <@${userClient.id}>!**`,
    guildClient
  )
  Functions.updateImpression(
    Common.uKeyv,
    userClient.id,
    userClient,
    Config.ImpressionValues.NEVERMIND_VALUE,
    userClient.settings.impressions
  )
}

module.exports = {
  name: 'nevermind',
  execute: nevermind
}
