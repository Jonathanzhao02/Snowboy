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
  const logger = userId ? guildClient.logger.child({ user: userId }) : guildClient.logger
  if (!guildClient) {
    Common.logger.warn('Attempted to leave, but no guildClient found')
    return
  }
  logger.info('Received leave command')

  if (userId) {
    if (!guildClient.connection) {
      logger.debug('Not connected')
      Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I am not connected to a voice channel!***`, guildClient)
      return
    }

    Functions.sendMsg(guildClient.textChannel,
      `${Emojis.farewell} **${Responses.farewells[Functions.random(Responses.farewells.length)]},** <@${userId}>!`,
      guildClient)
  }

  logger.debug('Leaving')
  logger.trace('Disconnecting')
  guildClient.connection.disconnect()
  guildClient.connection.removeAllListeners()
  if (guildClient.connection.dispatcher) {
    logger.trace('Ending dispatcher')
    guildClient.connection.dispatcher.end()
    guildClient.connection.dispatcher.destroy()
  }
  logger.trace('Cleaning up members')
  guildClient.members.forEach(member => { if (member.snowClient) member.snowClient.stop() })
  guildClient.members.clear()
  logger.trace('Leaving channel')
  guildClient.voiceChannel.leave()
  guildClient.voiceChannel = undefined
  guildClient.connection = undefined
  guildClient.loopState = 0
  logger.debug('Successfully left')
}

module.exports = {
  name: 'leave',
  execute: leave
}
