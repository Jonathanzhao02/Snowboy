const Common = require('../../common')
const { Functions, Impressions } = require('../../bot-util')
const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy sad.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function insult (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received insult command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.sad} *Okay...*`,
    memberClient.guildClient
  )
  Impressions.updateImpression(
    Common.uKeyv,
    memberClient.id,
    memberClient.userClient,
    ImpressionValues.SAD_VALUE,
    memberClient.userClient.settings.impressions
  )
}

module.exports = {
  name: 'insult',
  execute: insult
}
