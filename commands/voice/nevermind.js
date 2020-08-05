const Common = require('../../bot-util/Common')
const Impressions = require('../../bot-util/Impressions')
const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy mildy irritated that someone called it just to say nevermind.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function nevermind (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received nevermind command')
  memberClient.guildClient.sendMsg(
    `${Emojis.angry} **Call me only when you need me, <@${memberClient.id}>!**`
  )
  Impressions.updateImpression(
    Common.uKeyv,
    memberClient.id,
    memberClient.userClient,
    ImpressionValues.NEVERMIND_VALUE,
    memberClient.userClient.settings.impressions
  )
}

module.exports = {
  name: 'nevermind',
  execute: nevermind
}
