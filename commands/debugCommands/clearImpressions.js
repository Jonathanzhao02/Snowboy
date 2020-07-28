const Common = require('../../common')
const { Functions } = require('../../bot-util')

/**
 * Clears the impressions of all tracked users in a server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function clearImpressions (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received clear impressions command')
  Common.botClient.users.cache.forEach(usr => {
    Common.logger.debug(`Deleting impression of ${usr.id}`)
    if (Common.botClient.userClients.get(usr.id)) {
      Common.botClient.userClients.get(usr.id).impression = 0
    }
    Common.uKeyv.delete(`${usr.id}:impression`)
  })
  Functions.sendMsg(
    guildClient.textChannel,
    'Cleared all impressions',
    guildClient
  )
}

module.exports = {
  name: 'clearimpressions',
  execute: clearImpressions
}
