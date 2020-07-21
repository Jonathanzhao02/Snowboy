const { Functions } = require('../../bot-util')

/**
 * Prints all the raw impressions of members in a server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function rawImpressions (guildClient, userId, args) {
  guildClient.logger.info('Received raw impressions command')
  const response = ['Raw impressions:']
  guildClient.members.forEach(mmbr => {
    response.push(`    **${mmbr.member.displayName}**: \`${mmbr.impression}\``)
  })
  Functions.sendMsg(guildClient.textChannel, response.join('\n'), guildClient)
}

module.exports = {
  name: 'rawimpressions',
  execute: rawImpressions
}
