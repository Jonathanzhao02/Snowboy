const Emojis = require('../../emojis')
const { Responses, Functions } = require('../../bot-util')

/**
 * Disconnects and says goodbye to a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 */
function farewell (guildClient, userId, args) {
  guildClient.logger.info('Received farewell command')
  const voiceStates = guildClient.textChannel.guild.voiceStates.cache
  const userVoiceState = voiceStates.find(state => state.id === userId)
  if (userVoiceState) userVoiceState.setChannel(null)

  if (guildClient && guildClient.members.get(userId)) {
    guildClient.members.get(userId).snowClient.stop()
    guildClient.members.delete(userId)
    Functions.sendMsg(guildClient.textChannel,
      `${Emojis.farewell} **${Responses.farewells[Functions.random(Responses.farewells.length)]},** <@${userId}>!`,
      guildClient)
  } else {
    guildClient.logger.warn(`No member construct found for ${userId}`)
  }
}

module.exports = {
  name: 'farewell',
  execute: farewell
}
