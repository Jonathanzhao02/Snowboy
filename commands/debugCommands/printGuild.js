/**
 * Prints a guildClient to console.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId Unused parameter.
 * @param {String[]} args Unused parameter.
 */
function printGuild (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received print guild command')
  console.log(guildClient)
}

module.exports = {
  name: 'printguild',
  execute: printGuild
}
