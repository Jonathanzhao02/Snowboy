const Emojis = require('../../emojis')
const { Responses, Functions } = require('../../bot-util')

/**
 * Handles all setup associated with the connection.
 *
 * @param {Discord.VoiceConnection} connection The VoiceConnection from the VoiceChannel.
 * @param {Object} guildClient The guildClient associated with the server of the connection.
 */
function connectionHandler (connection, guildClient) {
  guildClient.logger.info('Successfully connected')
  guildClient.connection = connection
  Functions.playSilence(guildClient)
}

/**
 * Makes Snowboy join a VoiceChannel.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg The Message the user sent.
 */
function join (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received join command')
  // If the user is not connected to a VoiceChannel, notify and return
  if (!msg.member.voice.channel) {
    logger.trace('Member not connected')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***You are not connected to a voice channel!***`
    )
    return
  // Otherwise, set the guildClient VoiceChannel to the member's
  } else {
    memberClient.guildClient.voiceChannel = msg.member.voice.channel
  }

  // If already connected, notify and return
  if (memberClient.guildClient.connection) {
    logger.trace('Already connected')
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***I'm already connected to a voice channel!***`
    )
    return
  }

  // Greet the user
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `${Emojis.greeting} **${Responses.greetings[Functions.random(Responses.greetings.length)]},** <@${memberClient.id}>!`,
    memberClient.guildClient.settings.mentions
  )

  // Attempt to join and handle the connection, or error
  logger.trace('Attempting to join')
  memberClient.guildClient.voiceChannel.join().then(connection => connectionHandler(connection, memberClient.guildClient)).catch(e => {
    Functions.sendMsg(
      memberClient.guildClient.textChannel,
      `${Emojis.error} ***Could not connect! \\;(***`
    ).then(() => { throw e })
  })
}

module.exports = {
  name: 'join',
  execute: join
}
