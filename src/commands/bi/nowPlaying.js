const Embeds = require('../../bot-util/Embeds')
const { Emojis } = require('../../config')

/**
 * Sends the help embed about Snowboy to a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function nowPlaying (context) {
  const logger = context.logger
  logger.info('Received now playing command')
  const video = context.guildClient.guildPlayer.songQueuer[0]
  if (video && context.guildClient.playing) {
    context.sendMsg(
      Embeds.createVideoEmbed(video)
    )
  } else {
    context.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
  }
}

module.exports = {
  name: 'nowplaying',
  form: 'nowplaying',
  description: 'Lists out what\'s currently playing.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY'],
  execute: nowPlaying
}
