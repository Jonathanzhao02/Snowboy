const { Emojis } = require('../../config')

/**
 * Undeafens a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function undeafen (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Setting deafen state of %s to `false`', memberClient.member.displayName)
  const userVoiceState = memberClient.member.voice
  if (userVoiceState) userVoiceState.setDeaf(false)
  memberClient.guildClient.sendMsg(
    `**${Emojis.unmute} Undeafened <@${memberClient.id}>**`
  )
}

module.exports = {
  name: 'undeafen',
  aliases: ['unmute'],
  execute: undeafen
}
