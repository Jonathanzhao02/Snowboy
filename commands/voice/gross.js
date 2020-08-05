const Common = require('../../bot-util/Common')
const Functions = require('../../bot-util/Functions')
const Impressions = require('../../bot-util/Impressions')
const { ImpressionValues, Emojis } = require('../../config')

/**
 * Makes Snowboy grossed out.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function gross (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received gross command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.weird} **Not much I can do for you, <@${memberClient.id}>**`,
    memberClient.guildClient.settings.mentions
  )
  Impressions.updateImpression(
    Common.uKeyv,
    memberClient.id,
    memberClient.userClient,
    ImpressionValues.GROSS_VALUE,
    memberClient.userClient.settings.impressions
  )
}

module.exports = {
  name: 'gross',
  execute: gross
}
