const Common = require('../../bot-util/Common')
const Keyv = require('../../bot-util/Keyv')

/**
 * Clears the impressions of all tracked users in a server.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg The sent message.
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
      Keyv.setImpression(member.id, 0)
    })
    memberClient.guildClient.sendMsg(
      'Cleared all guild impressions',
      msg.channel
    )
  })
}

module.exports = {
  name: 'clearimpressions',
  execute: clearImpressions
}
