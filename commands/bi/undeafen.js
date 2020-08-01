const { Emojis } = require('../../config')
const { Functions } = require('../../bot-util')

/**
 * Undeafens a user.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function undeafen (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Setting deafen state of %s to `false`', memberClient.member.displayName)
  const userVoiceState = memberClient.member.voice
  if (userVoiceState) userVoiceState.setDeaf(false)
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `**${Emojis.unmute} Undeafened <@${memberClient.id}>**`,
    memberClient.guildClient.settings.mentions
  )
}

module.exports = {
  name: 'undeafen',
  aliases: ['unmute'],
  execute: undeafen
}
