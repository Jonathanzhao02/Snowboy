const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Makes Snowboy happy.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function compliment (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received compliment command')
  Functions.sendMsg(
    guildClient.textChannel,
    `${Emojis.happy} **Thank you!**`,
    guildClient
  )
  Functions.updateImpression(
    Common.uKeyv,
    userClient.id,
    userClient,
    Config.ImpressionValues.HAPPY_VALUE,
    userClient.settings.impressions
  )
}

module.exports = {
  name: 'compliment',
  execute: compliment
}
