const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Deafens a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested to deafen.
 * @param {String[]} args Unused parameter.
 */
function deafen (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info(`Setting deafen state of ${userId} to \`${true}\``)
  const voiceStates = guildClient.textChannel.guild.voiceStates.cache
  const userVoiceState = voiceStates.find(state => state.id === userId)
  if (userVoiceState) userVoiceState.setDeaf(true)
  Functions.sendMsg(guildClient.textChannel,
    `**${Emojis.mute} Deafened <@${userId}>**`,
    guildClient)
}

module.exports = {
  name: 'deafen',
  aliases: ['mute'],
  execute: deafen
}
