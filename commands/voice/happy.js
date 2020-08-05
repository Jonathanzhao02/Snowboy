const Common = require('../../bot-util/Common')
const Impressions = require('../../bot-util/Impressions')
const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy happy.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function compliment (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received compliment command')
  memberClient.guildClient.sendMsg(
    `${Emojis.happy} **Thank you!**`
  )
  Impressions.updateImpression(
    Common.uKeyv,
    memberClient.id,
    memberClient.userClient,
    ImpressionValues.HAPPY_VALUE,
    memberClient.userClient.settings.impressions
  )
}

module.exports = {
  name: 'compliment',
  execute: compliment
}
