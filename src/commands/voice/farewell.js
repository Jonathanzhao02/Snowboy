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
  const userVoiceState = context.voice
  if (userVoiceState.channel) userVoiceState.setChannel(null)
  context.sendMsg(
    `${Emojis.farewell} **${Responses.randomFarewell()},** <@${context.id}>!`
  )
}

module.exports = {
  name: 'farewell',
  usages: ['VOICE', 'GUILD_ONLY', 'IN_VOICE'],
  execute: farewell
}
