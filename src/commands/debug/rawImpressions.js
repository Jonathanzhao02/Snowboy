const Common = require('../../bot-util/Common')

/**
 * Prints all the raw impressions of members in a server.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg The sent message.
 */
function rawImpressions (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received raw impressions command')
  const response = ['Raw impressions:']
  Common.botClient.userClients.forEach(userClient => {
    response.push(`    **${userClient.user.displayName}**: \`${userClient.impression}\``)
  })
  memberClient.guildClient.sendMsg(
    response,
    msg.channel
  )
}

module.exports = {
  name: 'rawimpressions',
  usages: ['TEXT', 'GUILD_ONLY', 'DEBUG_ONLY'],
  execute: rawImpressions
}
