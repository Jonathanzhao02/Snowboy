const { Emojis } = require('../../config')
const Responses = require('../../bot-util/Responses')

/**
 * Disconnects and says goodbye to a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function farewell (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received farewell command')
  const userVoiceState = memberClient.member.voice
  if (userVoiceState) userVoiceState.setChannel(null)
  memberClient.guildClient.sendMsg(
    `${Emojis.farewell} **${Responses.randomFarewell()},** <@${memberClient.id}>!`
  )
}

module.exports = {
  name: 'farewell',
  usages: ['VOICE', 'GUILD_ONLY', 'IN_VOICE'],
  execute: farewell
}
