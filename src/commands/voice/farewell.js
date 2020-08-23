const { Emojis } = require('../../config')
const Responses = require('../../bot-util/Responses')

/**
 * Disconnects and says goodbye to a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function farewell (context) {
  const logger = context.logger
  logger.info('Received farewell command')
  context.voice.setChannel(null)
  context.sendMsg(
    `${Emojis.farewell} **${Responses.randomFarewell()},** <@${context.id}>!`
  )
}

module.exports = {
  name: 'farewell',
  usages: ['VOICE', 'GUILD_ONLY', 'WITH_BOT', 'IN_VOICE'],
  execute: farewell
}
