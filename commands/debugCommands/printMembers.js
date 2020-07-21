/**
 * Prints the members map to console.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function printMembers (guildClient, userId, args) {
  guildClient.logger.info('Received print members command')
  console.log(guildClient.members)
}

module.exports = {
  name: 'printmembers',
  execute: printMembers
}
