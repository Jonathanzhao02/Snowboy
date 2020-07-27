const { Responses, Functions } = require('../../bot-util')

/**
 * Prints Snowboy's impression of a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function impression (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received impression command')
  Functions.sendMsg(guildClient.textChannel,
    Responses.getResponse('impression', guildClient.members.get(userId).impression, [`<@${userId}>`], guildClient.settings.impressions),
    guildClient)
}

module.exports = {
  name: 'impression',
  execute: impression
}
