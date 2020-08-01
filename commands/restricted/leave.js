const Common = require('../../bot-util/Common')
const Functions = require('../../bot-util/Functions')
const Responses = require('../../bot-util/Responses')
const { Emojis } = require('../../config')

/**
 * Leaves the VoiceChannel.
 *
 * @param {Object} client The client who requested this command. (could be guildClient or memberClient)
 * @param {String[]} args Unused parameter.
 */
function leave (client, args) {
  if (!client) {
    Common.logger.warn('Attempted to leave, but no client found!')
    return
  }
  const logger = client.logger
  logger.info('Received leave command')

  // Gets the guildClient from the passed in client
  const guildClient = client.guildClient ? client.guildClient : client

  // If the passed object is a memberClient
  if (client.member) {
    if (!guildClient.connection) {
      logger.debug('Not connected')
      Functions.sendMsg(
        guildClient.textChannel,
        `${Emojis.error} ***I am not connected to a voice channel!***`
      )
      return
    }

    Functions.sendMsg(
      guildClient.textChannel,
      `${Emojis.farewell} **${Responses.randomFarewell()},** <@${client.id}>!`,
      guildClient.settings.mentions
    )
  }

  logger.debug('Leaving')
  logger.trace('Disconnecting')
  guildClient.songQueue = []
  if (guildClient.connection.dispatcher) {
    logger.trace('Ending dispatcher')
    guildClient.connection.dispatcher.end()
  }
  logger.trace('Cleaning up members')
  guildClient.memberClients.forEach(member => { if (member.snowClient) member.snowClient.stop() })
  guildClient.memberClients.clear()
  logger.trace('Leaving channel')
  guildClient.connection.disconnect()
  guildClient.connection.removeAllListeners()
  guildClient.voiceChannel.leave()
  guildClient.voiceChannel = null
  guildClient.textChannel = null
  guildClient.connection = null
  guildClient.loopState = 0
  logger.debug('Successfully left')
}

module.exports = {
  name: 'leave',
  execute: leave
}
