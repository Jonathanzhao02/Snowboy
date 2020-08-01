const { Emojis } = require('../../config')
const { Functions } = require('../../bot-util')

/**
 * Deafens a user.
 *
 * @param {Object} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 */
function deafen (memberClient, args) {
  const logger = memberClient.logger
  logger.info('Setting deafen state of %s to `true`', memberClient.member.displayName)
  const userVoiceState = memberClient.member.voice
  if (userVoiceState) userVoiceState.setDeaf(true)
  Functions.sendMsg(
    memberClient.guildClient.textChannel,
    `**${Emojis.mute} Deafened <@${memberClient.id}>**`,
    memberClient.guildClient.settings.mentions
  )
}

module.exports = {
  name: 'deafen',
  aliases: ['mute'],
  execute: deafen
}
