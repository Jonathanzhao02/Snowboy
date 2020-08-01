const { Functions } = require('../../bot-util')
const Common = require('../../common')

/**
 * Prints all the raw impressions of members in a server.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function rawImpressions (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received raw impressions command')
  const response = ['Raw impressions:']
  Common.botClient.userClients.forEach(userClient => {
    response.push(`    **${userClient.user.displayName}**: \`${userClient.impression}\``)
  })
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    response
  )
}

module.exports = {
  name: 'rawimpressions',
  execute: rawImpressions
}
