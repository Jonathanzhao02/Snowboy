/**
 * Prints a guildClient to console.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg Unused parameter.
 */
function printGuild (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received print guild command')
  console.log(memberClient.guildClient)
}

module.exports = {
  name: 'printguild',
  execute: printGuild
}
