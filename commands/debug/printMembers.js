/**
 * Prints the members map to console.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
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
