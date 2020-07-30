const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions, Impressions } = require('../../bot-util')
const Config = require('../../config')

/**
 * Makes Snowboy mildy irritated that someone called it just to say nevermind.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function nevermind (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received nevermind command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.angry} **Call me only when you need me, <@${memberClient.id}>!**`,
    memberClient.guildClient
  )
  Impressions.updateImpression(
    Common.uKeyv,
    memberClient.id,
    memberClient.userClient,
    Config.ImpressionValues.NEVERMIND_VALUE,
    memberClient.userClient.settings.impressions
  )
}

module.exports = {
  name: 'nevermind',
  execute: nevermind
}
