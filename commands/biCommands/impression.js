const { Responses, Functions } = require('../../bot-util')

/**
 * Prints Snowboy's impression of a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function impression (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received impression command')
  Functions.sendMsg(
    guildClient.textChannel,
    Responses.getResponse(
      'impression',
      userClient.impression,
      [`<@${userClient.id}>`],
      userClient.settings.impressions
    ),
    guildClient
  )
}

module.exports = {
  name: 'impression',
  execute: impression
}
