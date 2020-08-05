/**
 * Prints the members map to console.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg Unused parameter.
 */
function printMembers (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received print members command')
  console.log(memberClient.guildClient.memberClients)
}

module.exports = {
  name: 'printmembers',
  execute: printMembers
}
