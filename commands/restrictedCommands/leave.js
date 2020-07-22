const Common = require('../../common')
const Emojis = require('../../emojis')
const { Responses, Functions } = require('../../bot-util')

/**
 * Leaves the VoiceChannel.
 *
 * @param {Object} guildClient The guildClient of the server.
 * @param {String?} userId The ID of the user who requested Snowboy to leave.
 * @param {String[]} args Unused parameter.
 */
function leave (guildClient, userId, args) {
  if (!guildClient) {
    Common.logger.warn('Attempted to leave, but no guildClient found')
    return
  }
  guildClient.logger.info('Received leave command')

  if (!guildClient.connection) {
    guildClient.logger.debug('Not connected')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I am not connected to a voice channel!***`, guildClient)
    return
  }

  if (userId) {
    Functions.sendMsg(guildClient.textChannel,
      `${Emojis.farewell} **${Responses.farewells[Functions.random(Responses.farewells.length)]},** <@${userId}>!`,
      guildClient)
  }

  guildClient.logger.debug('Leaving')
  guildClient.logger.trace('Disconnecting')
  guildClient.connection.disconnect()
  guildClient.connection.removeAllListeners()
  if (guildClient.connection.dispatcher) {
    guildClient.logger.trace('Ending dispatcher')
    guildClient.connection.dispatcher.end()
    guildClient.connection.dispatcher.destroy()
  }
  guildClient.logger.trace('Cleaning up members')
  guildClient.members.forEach(member => { if (member.snowClient) member.snowClient.stop() })
  guildClient.members.clear()
  guildClient.logger.trace('Leaving channel')
  guildClient.voiceChannel.leave()
  guildClient.voiceChannel = undefined
  guildClient.connection = undefined
  guildClient.logger.debug('Successfully left')
}

module.exports = {
  name: 'leave',
  execute: leave
}
