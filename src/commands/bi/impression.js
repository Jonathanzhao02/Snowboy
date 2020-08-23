/**
 * Prints Snowboy's impression of a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function impression (context) {
  const logger = context.logger
  logger.info('Received impression command')
  context.client.sendResponse('impression', context.channel)
}

module.exports = {
  name: 'impression',
  form: 'impression',
  description: 'Tells you Snowboy\'s impression of you.',
  usages: ['VOICE', 'TEXT'],
  execute: impression
}
