const Common = require('../../bot-util/Common')

/**
 * Prints all the raw impressions of members in a server.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function rawImpressions (context) {
  const logger = context.logger
  logger.info('Received raw impressions command')
  const response = ['Raw impressions:']
  Common.botClient.userClients.forEach(userClient => {
    response.push(`    **${userClient.user.displayName}**: \`${userClient.impression}\``)
  })
  context.sendMsg(
    response
  )
}

module.exports = {
  name: 'rawimpressions',
  usages: ['TEXT', 'GUILD_ONLY', 'DEBUG_ONLY'],
  execute: rawImpressions
}
