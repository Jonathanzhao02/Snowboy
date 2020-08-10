const { Emojis } = require('../../config')

/**
 * Prints the ping of the bot to the server.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg The Message the user sent.
 */
function ping (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received ping command')
  const latency = Date.now() - msg.createdAt.getTime()
  memberClient.guildClient.sendMsg(
    `${Emojis.ping} **Current ping: \`${latency}ms\`**`
  )
}

module.exports = {
  name: 'ping',
  form: 'ping',
  description: 'Tells you Snowboy\'s ping to the server.',
  execute: ping
}
