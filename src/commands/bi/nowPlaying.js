const Embeds = require('../../bot-util/Embeds')

/**
 * Sends the help embed about Snowboy to a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function nowPlaying (context) {
  const logger = context.logger
  logger.info('Received now playing command')
  const video = context.guildClient.guildPlayer.songQueuer.first
  context.sendMsg(
    Embeds.createVideoEmbed(video)
  )
}

module.exports = {
  name: 'nowplaying',
  form: 'nowplaying',
  description: 'Lists out what\'s currently playing.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'MUSIC_PLAYING'],
  execute: nowPlaying
}
