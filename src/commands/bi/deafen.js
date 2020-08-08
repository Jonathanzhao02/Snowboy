const { Emojis } = require('../../config')

/**
 * Deafens a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function deafen (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Setting deafen state of %s to `true`', memberClient.member.displayName)
  const userVoiceState = memberClient.member.voice
  if (userVoiceState) userVoiceState.setDeaf(true)
  memberClient.guildClient.sendMsg(
    `**${Emojis.mute} Deafened <@${memberClient.id}>**`
  )
}

module.exports = {
  name: 'deafen',
  aliases: ['mute'],
  execute: deafen
}
