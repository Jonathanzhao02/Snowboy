/**
 * Clears the impressions of all tracked users in a server.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function clearImpressions (context) {
  const logger = context.logger
  logger.info('Received clear impressions command')

  context.guildClient.guild.members.fetch().then(members => {
    members.forEach(pair => {
      const member = pair[1]
      logger.debug('Deleting impression of %s', member.id)
      context.bot.userClients.get(member.id)?.setImpression(0) // eslint-disable-line no-unused-expressions
    })
    context.sendMsg(
      'Cleared all guild impressions'
    )
  })
}

module.exports = {
  name: 'clearimpressions',
  usages: ['TEXT', 'GUILD_ONLY', 'DEBUG_ONLY'],
  execute: clearImpressions
}
