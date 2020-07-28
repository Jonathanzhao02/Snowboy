const { Functions } = require('../../bot-util')

const Common = require('../../common')

/**
 * Prints all the raw impressions of members in a server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function rawImpressions (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received raw impressions command')
  const response = ['Raw impressions:']
  guildClient.members.forEach((mmbr, id) => {
    const userClient = Common.botClient.userClients.get(id)
    response.push(`    **${mmbr.member.displayName}**: \`${userClient.impression}\``)
  })
  Functions.sendMsg(guildClient.textChannel, response, guildClient)
}

module.exports = {
  name: 'rawimpressions',
  execute: rawImpressions
}
