const Keyv = require('../../bot-util/Keyv')

/**
 * Clears Snowboy's database completely and shuts the bot down.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg Unused parameter.
 */
function clearDb (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received clear database command')
  Keyv.clearAll()
  memberClient.guildClient.sendMsg(
    'Cleared Database'
  ).then(() => {
    memberClient.guildClient.sendMsg(
      'Shutting down Snowboy, restart for database changes to take effect'
    ).then(() => {
      process.emit('SIGINT')
    })
  })
}

module.exports = {
  name: 'cleardb',
  execute: clearDb
}
