const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Deafens a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested to deafen.
 * @param {String[]} args Unused parameter.
 */
function deafen (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info(`Setting deafen state of ${userClient.id} to \`${true}\``)
  const voiceStates = guildClient.textChannel.guild.voiceStates.cache
  const userVoiceState = voiceStates.find(state => state.id === userClient.id)
  if (userVoiceState) userVoiceState.setDeaf(true)
  Functions.sendMsg(
    guildClient.textChannel,
    `**${Emojis.mute} Deafened <@${userClient.id}>**`,
    guildClient
  )
}

module.exports = {
  name: 'deafen',
  aliases: ['mute'],
  execute: deafen
}
