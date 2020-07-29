const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')
const Config = require('../../config')

/**
 * Makes Snowboy happy.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function compliment (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received compliment command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.happy} **Thank you!**`
  )
  Functions.updateImpression(
    Common.uKeyv,
    memberClient.id,
    memberClient.userClient,
    Config.ImpressionValues.HAPPY_VALUE,
    memberClient.userClient.settings.impressions
  )
}

module.exports = {
  name: 'compliment',
  execute: compliment
}
