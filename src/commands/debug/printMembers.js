/**
 * Prints the members map to console.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function printMembers (context) {
  const logger = context.logger
  logger.info('Received print members command')
  console.log(context.guildClient.memberClients)
}

module.exports = {
  name: 'printmembers',
  usages: ['TEXT', 'GUILD_ONLY', 'DEBUG_ONLY'],
  execute: printMembers
}
