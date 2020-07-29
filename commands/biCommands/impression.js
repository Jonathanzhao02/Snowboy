const { Responses, Functions } = require('../../bot-util')

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
    Responses.getResponse(
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
