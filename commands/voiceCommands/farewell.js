const Emojis = require('../../emojis')
const { Responses, Functions } = require('../../bot-util')

/**
 * Disconnects and says goodbye to a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function farewell (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info('Received farewell command')
  const voiceStates = guildClient.textChannel.guild.voiceStates.cache
  const userVoiceState = voiceStates.find(state => state.id === userClient.id)
  if (userVoiceState) userVoiceState.setChannel(null)

  if (guildClient && guildClient.memberClients.get(userClient.id)) {
    guildClient.memberClients.get(userClient.id).snowClient.stop()
    guildClient.memberClients.delete(userClient.id)
    Functions.sendMsg(
      guildClient.textChannel,
      `${Emojis.farewell} **${Responses.farewells[Functions.random(Responses.farewells.length)]},** <@${userClient.id}>!`,
      guildClient
    )
  } else {
    logger.warn(`No member construct found for ${userClient.id}`)
  }
}

module.exports = {
  name: 'farewell',
  execute: farewell
}
