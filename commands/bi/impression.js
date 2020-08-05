/**
 * Prints Snowboy's impression of a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function impression (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received impression command')
  memberClient.sendResponse('impression')
}

module.exports = {
  name: 'impression',
  execute: impression
}
