const Common = require('../../bot-util/Common')
const Functions = require('../../bot-util/Functions')

/**
 * Clears Snowboy's database completely and shuts the bot down.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg Unused parameter.
 */
function clearDb (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received clear database command')
  Common.gKeyv.clear()
  Common.uKeyv.clear()
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    'Cleared Database'
  ).then(() => {
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
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
