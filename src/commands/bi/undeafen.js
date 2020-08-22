const { Emojis } = require('../../config')

/**
 * Undeafens a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message?} msg The sent message.
 */
function undeafen (memberClient, args, msg) {
  const channel = msg?.channel
  const logger = memberClient.logger
  logger.info('Setting deafen state of %s to `false`', memberClient.member.displayName)
  const userVoiceState = memberClient.member.voice
  if (userVoiceState) userVoiceState.setDeaf(false)
  memberClient.guildClient.sendMsg(
    `**${Emojis.unmute} Undeafened <@${memberClient.id}>**`,
    channel
  )
}

module.exports = {
  name: 'undeafen',
  aliases: ['unmute'],
  form: 'undeafen',
  description: 'Server undeafens the requester.',
  usages: ['VOICE', 'TEXT', 'GUILD_ONLY'],
  execute: undeafen
}
