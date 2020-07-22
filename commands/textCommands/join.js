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
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested the command.
 * @param {String[]} args Unused parameter.
 * @param {Discord.Message} msg The Message the user sent.
 */
function join (guildClient, userId, args, msg) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info('Received join command')
  // If the user is not connected to a VoiceChannel, notify and return
  if (!msg.member.voice.channel) {
    logger.trace('Member not connected')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***You are not connected to a voice channel!***`, guildClient)
    return
  // Otherwise, set the guildClient VoiceChannel to the member's
  } else {
    guildClient.voiceChannel = msg.member.voice.channel
  }

  // If already connected, notify and return
  if (guildClient.connection) {
    logger.trace('Already connected')
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***I'm already connected to a voice channel!***`, guildClient)
    return
  }

  // Greet the user
  Functions.sendMsg(guildClient.textChannel,
    `${Emojis.greeting} **${Responses.greetings[Functions.random(Responses.greetings.length)]},** <@${userId}>!`,
    guildClient)

  // Attempt to join and handle the connection, or error
  logger.trace('Attempting to join')
  guildClient.voiceChannel.join().then(connection => connectionHandler(connection, guildClient)).catch(e => {
    Functions.sendMsg(guildClient.textChannel, `${Emojis.error} ***Could not connect! \\;(***`, guildClient)
    throw e
  })
}

module.exports = {
  name: 'join',
  execute: join
}
