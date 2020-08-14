const Embeds = require('../../bot-util/Embeds')

/**
 * Prints the stats of Snowboy.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg The sent message.
 */
function stats (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received stats command')
  memberClient.guildClient.sendMsg(
    Embeds.createStatsEmbed(),
    msg.channel
  )
}

module.exports = {
  name: 'stats',
  form: 'stats',
  description: 'Tells you about Snowboy\'s stats.',
  execute: stats
}
