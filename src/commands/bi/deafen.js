const { Emojis } = require('../../config')

/**
 * Deafens a user.
 *
 * @param {import('../../structures/CommandContext')} context The command context.
 */
function deafen (context) {
  const logger = context.logger
  logger.info('Setting deafen state of %s to `true`', context.name)
  if (context.voice) {
    context.voice.setDeaf(true)
    context.sendMsg(
      `**${Emojis.mute} Deafened <@${context.id}>**`
    )
  } else {
    context.sendMsg(
      `${Emojis.error} **You are not connected to a voice channel!**`
    )
  }
}

module.exports = {
  name: 'deafen',
  aliases: ['mute'],
  form: 'deafen',
  description: 'Server deafens the requester.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY'],
  execute: deafen
}
