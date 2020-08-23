const { Emojis } = require('../../config')
const Responses = require('../../bot-util/Responses')

/**
 * Makes Snowboy join a VoiceChannel.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function join (context) {
  const logger = context.logger
  logger.info('Received join command')

  // If already connected, notify and return
  if (context.guildClient.connection) {
    logger.trace('Already connected')
    context.sendMsg(
      `${Emojis.error} ***I'm already connected to a voice channel!***`
    )
    return
  }

  // Attempt to join and handle the connection, or error
  logger.trace('Attempting to join')
  context.guildClient.connect(context.memberClient.member.voice.channel).then(connection => {
    if (connection) {
      // Assign the boundTextChannel
      if (!context.guildClient.boundTextChannel || context.guildClient.boundTextChannel.deleted) {
        context.guildClient.boundTextChannel = context.channel
      }
      // Greet the user
      context.sendMsg(
        `${Emojis.greeting} **${Responses.randomGreeting()},** <@${context.id}>!`
      )
    }
  })
}

module.exports = {
  name: 'join',
  form: 'join',
  description: 'Tells Snowboy to join the requester\'s voice channel.',
  usages: ['TEXT', 'GUILD_ONLY', 'IN_VOICE'],
  execute: join
}
