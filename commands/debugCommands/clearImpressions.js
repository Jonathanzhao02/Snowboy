const Common = require('../../common')
const { Functions } = require('../../bot-util')

/**
 * Clears the impressions of all tracked users in a server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function clearImpressions (guildClient, userId, args) {
  guildClient.logger.info('Received clear impressions command')
  Common.botClient.guildClients.forEach(gc => gc.members.forEach(usr => {
    usr.impression = 0
    Common.keyv.delete(`${guildClient.guild.id}:${usr.id}:impression`)
  }))
  Functions.sendMsg(guildClient.textChannel, 'Cleared all impressions', guildClient)
}

module.exports = {
  name: 'clearimpressions',
  execute: clearImpressions
}
