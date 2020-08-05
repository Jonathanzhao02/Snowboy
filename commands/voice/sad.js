const Common = require('../../bot-util/Common')
const Functions = require('../../bot-util/Functions')
const Impressions = require('../../bot-util/Impressions')
const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy sad.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
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
