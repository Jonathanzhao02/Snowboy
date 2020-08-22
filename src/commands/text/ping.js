const { Emojis } = require('../../config')

/**
 * Prints the ping of the bot to the server.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function ping (context) {
  const logger = context.logger
  logger.info('Received ping command')
  const latency = Date.now() - context.timestamp
  context.sendMsg(
    `${Emojis.ping} **Current ping: \`${latency}ms\`**`
  )
}

module.exports = {
  name: 'ping',
  form: 'ping',
  description: 'Tells you Snowboy\'s current ping.',
  usages: ['TEXT'],
  execute: ping
}
