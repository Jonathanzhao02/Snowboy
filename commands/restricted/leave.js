const Common = require('../../bot-util/Common')
const Functions = require('../../bot-util/Functions')
const Guilds = require('../../bot-util/Guilds')
const Responses = require('../../bot-util/Responses')
const { Emojis } = require('../../config')

/**
 * Leaves the VoiceChannel.
 *
 * @param {import('../../structures/MemberClient')} memberClient The client who requested this command. (could be guildClient or memberClient)
 * @param {String[]} args Unused parameter.
 */
function leave (memberClient, args) {
  if (!memberClient) {
    Common.logger.warn('Attempted to leave, but no client found!')
    return
  }
  const logger = memberClient.logger
  logger.info('Received leave command')

  // If successfully left
  if (Guilds.leaveVoiceChannel(memberClient.guildClient)) {
    logger.info('Successfully left')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.farewell} **${Responses.randomFarewell()},** <@${memberClient.id}>!`,
      memberClient.guildClient.settings.mentions
    )
  // If could not leave for some reason
  } else {
    logger.info('Could not leave')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***I am not connected to a voice channel!***`
    )
  }
}

module.exports = {
  name: 'leave',
  execute: leave
}
