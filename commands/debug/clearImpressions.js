const Common = require('../../bot-util/Common')
const Functions = require('../../bot-util/Functions')

/**
 * Clears the impressions of all tracked users in a server.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function clearImpressions (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received clear impressions command')

  memberClient.guildClient.guild.members.fetch().then(members => {
    members.forEach(pair => {
      const member = pair[1]
      logger.debug('Deleting impression of %s', member.id)
      if (Common.botClient.userClients.get(member.id)) {
        Common.botClient.userClients.get(member.id).impression = 0
      }
      Common.uKeyv.delete(`${member.id}:impression`)
    })
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      'Cleared all guild impressions'
    )
  })
}

module.exports = {
  name: 'clearimpressions',
  execute: clearImpressions
}
