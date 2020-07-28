const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Prints the ping of the bot to the server.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient Unused parameter.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg The Message the user sent.
 */
function ping (guildClient, userClient, args, msg) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received ping command')
  const latency = Date.now() - msg.createdAt.getTime()
  Functions.sendMsg(
    guildClient.textChannel,
    `${Emojis.ping} **Current ping: \`${latency}ms\`**`,
    guildClient
  )
}

module.exports = {
  name: 'ping',
  execute: ping
}
