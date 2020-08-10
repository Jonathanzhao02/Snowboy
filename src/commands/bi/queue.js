const Embeds = require('../../bot-util/Embeds')
const { Emojis } = require('../../config')

/**
 * Sends the help embed about Snowboy to a user.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args The specific command to ask about.
 * @param {import('discord.js').Message} msg Unused parameter.
 */
function queue (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received queue command')
  if (memberClient.guildClient.playing) {
    memberClient.guildClient.sendMsg(Embeds.createQueueEmbed(memberClient.guildClient.guildPlayer.ytHelper))
  } else {
    memberClient.guildClient.sendMsg(`${Emojis.error} ***Nothing currently playing!***`)
  }
}

module.exports = {
  name: 'queue',
  form: 'queue',
  description: 'Lists the current queue.',
  execute: queue
}
