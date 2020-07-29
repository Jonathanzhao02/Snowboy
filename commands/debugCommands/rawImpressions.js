const { Functions } = require('../../bot-util')
const Common = require('../../common')

/**
 * Prints all the raw impressions of members in a server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function rawImpressions (guildClient, userClient, args, msg) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received raw impressions command')
  const response = ['Raw impressions:']
  Common.botClient.userClients.forEach(userClient => {
    response.push(`    **${userClient.user.displayName}**: \`${userClient.impression}\``)
  })
  Functions.sendMsg(guildClient.textChannel, response, guildClient)
}

module.exports = {
  name: 'rawimpressions',
  execute: rawImpressions
}
