/**
 * Prints a guildClient to console.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function printGuild (context) {
  const logger = context.logger
  logger.info('Received print guild command')
  console.log(context.guildClient)
}

module.exports = {
  name: 'printguild',
  usages: ['TEXT', 'GUILD_ONLY', 'DEBUG_ONLY'],
  execute: printGuild
}
