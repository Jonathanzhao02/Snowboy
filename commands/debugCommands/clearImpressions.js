const Common = require('../../common')
const { Functions } = require('../../bot-util')

/**
 * Clears the impressions of all tracked users in a server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function clearImpressions (guildClient, userClient, args, msg) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received clear impressions command')

  guildClient.guild.members.fetch().then(members => {
    members.forEach(pair => {
      const member = pair[1]
      logger.debug(`Deleting impression of ${member.id}`)
      if (Common.botClient.userClients.get(member.id)) {
        Common.botClient.userClients.get(member.id).impression = 0
      }
      Common.uKeyv.delete(`${member.id}:impression`)
    })
    Functions.sendMsg(
      guildClient.textChannel,
      'Cleared all guild impressions',
      guildClient
    )
  })
}

module.exports = {
  name: 'clearimpressions',
  execute: clearImpressions
}
