const Emojis = require('../../emojis')
const { Functions } = require('../../bot-util')

/**
 * Undeafens a user.
 *
 * @param {Object} guildClient The guildClient of the server the user is in.
 * @param {Object} userClient The userClient of the user who requested to undeafen.
 * @param {String[]} args Unused parameter.
 */
function undeafen (guildClient, userClient, args) {
  const logger = guildClient.logger.child({ user: userClient.id })
  logger.info(`Setting deafen state of ${userClient.id} to \`${false}\``)
  const userVoiceState = guildClient.memberClients.get(userClient.id).member.voice
  if (userVoiceState) userVoiceState.setDeaf(false)
  Functions.sendMsg(
    guildClient.textChannel,
    `**${Emojis.unmute} Undeafened <@${userClient.id}>**`,
    guildClient
  )
}

module.exports = {
  name: 'undeafen',
  aliases: ['unmute'],
  execute: undeafen
}
