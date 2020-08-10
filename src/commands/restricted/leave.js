const Responses = require('../../bot-util/Responses')
const { Emojis } = require('../../config')

/**
 * Leaves the VoiceChannel.
 *
 * @param {import('../../structures/MemberClient')} memberClient The client who requested this command. (could be guildClient or memberClient)
 * @param {String[]} args Unused parameter.
 */
function leave (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received leave command')

  // If successfully left
  if (memberClient.guildClient.leaveVoiceChannel()) {
    logger.info('Successfully left')
    memberClient.guildClient.sendMsg(
      `${Emojis.farewell} **${Responses.randomFarewell()},** <@${memberClient.id}>!`
    )
  // If could not leave for some reason
  } else {
    logger.info('Could not leave')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***I am not connected to a voice channel!***`
    )
  }
}

module.exports = {
  name: 'leave',
  form: 'leave',
  description: 'Tells Snowboy to leave the current voice channel.',
  execute: leave
}
