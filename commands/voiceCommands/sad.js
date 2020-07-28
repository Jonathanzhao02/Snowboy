const Common = require('../../common')
const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

const Config = require('../../config')

/**
 * Makes Snowboy sad.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function insult (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received insult command')
  Functions.sendMsg(
    guildClient.textChannel,
    `${Emojis.sad} *Okay...*`,
    guildClient
  )
  Functions.updateImpression(
    Common.uKeyv,
    userClient.id, userClient,
    Config.ImpressionValues.SAD_VALUE,
    userClient.settings.impressions
  )
}

module.exports = {
  name: 'insult',
  execute: insult
}
