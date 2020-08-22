const Keyv = require('../../bot-util/Keyv')

/**
 * Clears Snowboy's database completely and shuts the bot down.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg The sent message.
 */
function clearDb (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received clear database command')
  Keyv.clearAll()
  memberClient.guildClient.sendMsg(
    'Cleared Database',
    msg.channel
  ).then(() => {
    memberClient.guildClient.sendMsg(
      'Shutting down Snowboy, restart for database changes to take effect',
      msg.channel
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
