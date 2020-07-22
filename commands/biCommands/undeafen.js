const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Undeafens a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {String} userId The ID of the user who requested to undeafen.
 * @param {String[]} args Unused parameter.
 */
function undeafen (guildClient, userId, args) {
  const logger = guildClient.logger.child({ user: userId })
  logger.info(`Setting deafen state of ${userId} to \`${false}\``)
  const voiceStates = guildClient.textChannel.guild.voiceStates.cache
  const userVoiceState = voiceStates.find(state => state.id === userId)
  if (userVoiceState) userVoiceState.setDeaf(false)
  Functions.sendMsg(guildClient.textChannel,
    `**${Emojis.unmute} Undeafened <@${userId}>**`,
    guildClient)
}

module.exports = {
  name: 'undeafen',
  aliases: ['unmute'],
  execute: undeafen
}
