const { Emojis } = require('../../config')

/**
 * Undeafens a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function undeafen (context) {
  const logger = context.logger
  logger.info('Setting deafen state of %s to `false`', context.name)
  if (context.voice) {
    context.voice.setDeaf(true)
    context.sendMsg(
      `**${Emojis.mute} Undeafened <@${context.id}>**`
    )
  } else {
    context.sendMsg(
      `${Emojis.error} **You are not connected to a voice channel!**`
    )
  }
}

module.exports = {
  name: 'undeafen',
  aliases: ['unmute'],
  form: 'undeafen',
  description: 'Server undeafens the requester.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY'],
  execute: undeafen
}
