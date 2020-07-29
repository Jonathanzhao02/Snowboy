const Emojis = require('../../emojis')
const { Responses, Functions } = require('../../bot-util')

/**
 * Disconnects and says goodbye to a user.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function farewell (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Received farewell command')
  const userVoiceState = memberClient.member.voice
  if (userVoiceState) userVoiceState.setChannel(null)

  if (memberClient.guildClient) {
    memberClient.snowClient.stop()
    memberClient.guildClient.memberClients.delete(memberClient.id)
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.farewell} **${Responses.farewells[Functions.random(Responses.farewells.length)]},** <@${memberClient.id}>!`,
      memberClient.guildClient.settings.mentions
    )
  } else {
    logger.warn('No guildClient found!')
  }
}

module.exports = {
  name: 'farewell',
  execute: farewell
}
