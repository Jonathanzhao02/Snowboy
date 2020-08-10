const Common = require('../../bot-util/Common')
const { Emojis } = require('../../config')

/**
 * Prints the stats of Snowboy.
 *
 * @param {import('../../structures/MemberClient')} memberClient The memberClient of the member who requested this command.
 * @param {String[]} args Unused parameter.
 * @param {import('discord.js').Message} msg Unused parameter.
 */
function stats (memberClient, args, msg) {
  const logger = memberClient.logger
  logger.info('Received stats command')
  memberClient.guildClient.sendMsg(
    `${Emojis.stats} **I am currently in \`${Common.botClient.guilds.cache.size}\` servers!**`
  )
}

module.exports = {
  name: 'stats',
  form: 'stats',
  description: 'Tells you about Snowboy\'s stats.',
  execute: stats
}
