const { Emojis } = require('../../config')
const Responses = require('../../bot-util/Responses')

/**
 * Makes Snowboy join a VoiceChannel.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg The Message the user sent.
 */
function join (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received join command')
  // If the user is not connected to a VoiceChannel, notify and return
  if (!msg.member.voice.channel) {
    logger.trace('Member not connected')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***You are not connected to a voice channel!***`
    )
    return
  }

  // If already connected, notify and return
  if (memberClient.guildClient.connection) {
    logger.trace('Already connected')
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***I'm already connected to a voice channel!***`
    )
    return
  }

  // Greet the user
  memberClient.guildClient.sendMsg(
    `${Emojis.greeting} **${Responses.randomGreeting()},** <@${memberClient.id}>!`
  )

  // Attempt to join and handle the connection, or error
  logger.trace('Attempting to join')
  memberClient.guildClient.joinVoiceChannel(msg.member.voice.channel)
}

module.exports = {
  name: 'join',
  execute: join
}
