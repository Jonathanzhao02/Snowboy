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
  memberClient.guildClient.sendMsg(
    `${Emojis.sad} *Okay...*`
  )
  Impressions.updateImpression(
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
