const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Makes Snowboy grossed out.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function gross (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received gross command')
  Functions.sendMsg(
    guildClient.textChannel,
    `${Emojis.weird} **Not much I can do for you, <@${userClient.id}>**`,
    guildClient
  )
  Functions.updateImpression(
    Common.uKeyv,
    userClient.id,
    userClient,
    Config.ImpressionValues.GROSS_VALUE,
    userClient.settings.impressions
  )
}

module.exports = {
  name: 'gross',
  execute: gross
}
