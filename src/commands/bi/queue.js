const Embeds = require('../../bot-util/Embeds')

/**
 * Sends the help embed about Snowboy to a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function queue (context) {
  const logger = context.logger
  logger.info('Received queue command')
  context.sendMsg(
    Embeds.createQueueEmbed(context.guildClient.guildPlayer.songQueuer)
  )
}

module.exports = {
  name: 'queue',
  form: 'queue',
  description: 'Lists the current queue.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY', 'MUSIC_PLAYING'],
  execute: queue
}
