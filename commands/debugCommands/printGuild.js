/**
 * Prints a guildClient to console.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function printGuild (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received print guild command')
  console.log(guildClient)
}

module.exports = {
  name: 'printguild',
  execute: printGuild
}
