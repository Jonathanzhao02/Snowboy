const Keyv = require('../../bot-util/Keyv')

/**
 * Clears Snowboy's database completely and shuts the bot down.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function clearDb (context) {
  const logger = context.logger
  logger.info('Received clear database command')
  Keyv.clearAll()
  context.sendMsg(
    'Cleared Database'
  ).then(() => {
    context.sendMsg(
      'Shutting down Snowboy, restart for database changes to take effect'
    ).then(() => {
      process.emit('SIGINT')
    })
  })
}

module.exports = {
  name: 'cleardb',
  usages: ['TEXT', 'GUILD_ONLY', 'DEBUG_ONLY'],
  execute: clearDb
}
