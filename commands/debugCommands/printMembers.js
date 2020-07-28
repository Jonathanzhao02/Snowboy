/**
 * Prints the members map to console.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function printMembers (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received print members command')
  console.log(guildClient.memberClients)
}

module.exports = {
  name: 'printmembers',
  execute: printMembers
}
