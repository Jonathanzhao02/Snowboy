/**
 * Prints Snowboy's impression of a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function impression (memberClient, args, msg) {
  const channel = msg?.channel
  const logger = memberClient.logger
  logger.info('Received impression command')
  memberClient.sendResponse('impression', channel)
}

module.exports = {
  name: 'impression',
  form: 'impression',
  description: 'Tells you Snowboy\'s impression of you.',
  usages: ['VOICE', 'TEXT'],
  execute: impression
}
