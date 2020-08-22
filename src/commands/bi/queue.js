const Embeds = require('../../bot-util/Embeds')
const { Emojis } = require('../../config')

/**
 * Sends the help embed about Snowboy to a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function queue (context) {
  const logger = context.logger
  logger.info('Received queue command')
  if (context.guildClient.playing) {
    context.sendMsg(
      Embeds.createQueueEmbed(context.guildClient.guildPlayer.songQueuer)
    )
  } else {
    context.sendMsg(
      `${Emojis.error} ***Nothing currently playing!***`
    )
  }
}

module.exports = {
  name: 'queue',
  form: 'queue',
  description: 'Lists the current queue.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY'],
  execute: queue
}
