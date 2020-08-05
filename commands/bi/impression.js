const Functions = require('../../bot-util/Functions')
const Impressions = require('../../bot-util/Impressions')

/**
 * Prints Snowboy's impression of a user.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function impression (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received impression command')
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    Impressions.getResponse(
      'impression',
      memberClient.userClient.impression,
      [`<@${memberClient.id}>`],
      memberClient.userClient.settings.impressions
    ),
    memberClient.guildClient.settings.mentions
  )
}

module.exports = {
  name: 'impression',
  execute: impression
}
