const { Emojis } = require('../../config')
const Functions = require('../../bot-util/Functions')
const Responses = require('../../bot-util/Responses')

/**
 * Handles all setup associated with the connection.
 *
 * @param {import('discord.js').VoiceConnection} connection The VoiceConnection from the VoiceChannel.
 * @param {import('../../structures/GuildClient')} guildClient The guildClient associated with the server of the connection.
 */
function connectionHandler (connection, guildClient) {
  guildClient.logger.info('Successfully connected')
  guildClient.connection = connection
  Functions.playSilence(guildClient)
}

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
  // Otherwise, set the guildClient's VoiceChannel to the member's
  } else {
    memberClient.guildClient.voiceChannel = msg.member.voice.channel
  }

  // Check that Snowboy has all necessary permissions in text channel and voice channel
  const { voicePermissions } = memberClient.guildClient.checkPermissions()
  if (voicePermissions) {
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Please ensure I have all the following permissions in your voice channel! I won't completely work otherwise!***`
    )
    memberClient.guildClient.sendMsg(
      Functions.formatList(voicePermissions)
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
  memberClient.guildClient.voiceChannel.join().then(connection => connectionHandler(connection, memberClient.guildClient)).catch(e => {
    memberClient.guildClient.sendMsg(
      `${Emojis.error} ***Could not connect! \\;(***`
    ).then(() => { throw e })
  })
}

module.exports = {
  name: 'join',
  execute: join
}
