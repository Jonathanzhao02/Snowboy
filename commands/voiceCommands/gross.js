const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')
const Config = require('../../config')

/**
 * Makes Snowboy grossed out.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
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
  Functions.updateImpression(
    Common.uKeyv,
    memberClient.id,
    memberClient.userClient,
    Config.ImpressionValues.GROSS_VALUE,
    memberClient.userClient.settings.impressions
  )
}

module.exports = {
  name: 'gross',
  execute: gross
}
