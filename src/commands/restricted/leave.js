const Responses = require('../../bot-util/Responses')
const { Emojis } = require('../../config')

/**
 * Leaves the VoiceChannel.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function leave (context) {
  const logger = context.logger
  logger.info('Received leave command')

  // If successfully left
  if (context.guildClient.connection) {
    context.guildClient.disconnect()
    logger.info('Successfully left')
    context.sendMsg(
      `${Emojis.farewell} **${Responses.randomFarewell()},** <@${context.id}>!`
    )
  // If could not leave for some reason
  } else {
    logger.info('Could not leave')
    context.sendMsg(
      `${Emojis.error} ***I am not connected to a voice channel!***`
    )
  }
}

module.exports = {
  name: 'leave',
  form: 'leave',
  description: 'Tells Snowboy to leave the current voice channel.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'IN_VOICE'],
  execute: leave
}
